import { auth } from "@/auth";
import { StravaAPI } from "@/lib/stravaAPI";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const session: any = await auth();
    if (!session?.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const accessToken = session?.accessToken;

    // Get user's Strava data from database
    const query = `
      query GetUserStravaData($userId: uuid!) {
        users_by_pk(id: $userId) {
          id
          strava_access_token
          strava_refresh_token
          strava_expires_at
        }
      }
    `;

    const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query,
        variables: { userId: session.userId },
      }),
    });

    if (!response.ok) {
      console.error("HTTP Error:", response.status, await response.text());
      return new Response("Failed to fetch user Strava data", {
        status: response.status,
      });
    }

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      return new Response("GraphQL errors occurred", { status: 500 });
    }

    const user = result.data?.users_by_pk;
    if (!user?.strava_access_token) {
      return new Response(JSON.stringify({ connected: false, bikes: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Initialize Strava API with access token
    const stravaAPI = new StravaAPI(user.strava_access_token);

    // Check if token is still valid, refresh if needed
    const isValid = await stravaAPI.isTokenValid();
    let currentAccessToken = user.strava_access_token;

    if (!isValid && user.strava_refresh_token) {
      const newTokens = await StravaAPI.refreshToken(user.strava_refresh_token);

      if (newTokens) {
        currentAccessToken = newTokens.access_token;

        // Update tokens in database
        const updateQuery = `
          mutation UpdateStravaTokens($userId: uuid!, $accessToken: String!, $refreshToken: String!, $expiresAt: bigint!) {
            update_users_by_pk(
              pk_columns: { id: $userId }
              _set: {
                strava_access_token: $accessToken
                strava_refresh_token: $refreshToken
                strava_expires_at: $expiresAt
              }
            ) {
              id
            }
          }
        `;

        await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            query: updateQuery,
            variables: {
              userId: session.userId,
              accessToken: newTokens.access_token,
              refreshToken: newTokens.refresh_token,
              expiresAt: newTokens.expires_at,
            },
          }),
        });
      } else {
        return new Response(
          JSON.stringify({ connected: false, needsReauth: true, bikes: [] }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Fetch bikes from Strava
    const stravaAPIWithCurrentToken = new StravaAPI(currentAccessToken);
    const bikes = await stravaAPIWithCurrentToken.getBikes();

    return new Response(
      JSON.stringify({
        connected: true,
        bikes: bikes || [],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching Strava bikes:", error);
    return new Response("Something went wrong", { status: 500 });
  }
};
