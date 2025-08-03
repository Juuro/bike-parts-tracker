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
          strava_id
          strava_access_token
          strava_refresh_token
          strava_expires_at
          strava_connected_at
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
      return new Response(JSON.stringify({ connected: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if token is still valid
    const stravaAPI = new StravaAPI(user.strava_access_token);
    const isValid = await stravaAPI.isTokenValid();

    if (!isValid && user.strava_refresh_token) {
      // Try to refresh the token
      const newTokens = await StravaAPI.refreshToken(user.strava_refresh_token);

      if (newTokens) {
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

        return new Response(
          JSON.stringify({
            connected: true,
            strava_id: user.strava_id,
            connected_at: user.strava_connected_at,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        // Token refresh failed, user needs to reconnect
        return new Response(
          JSON.stringify({ connected: false, needsReauth: true }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        connected: isValid,
        strava_id: user.strava_id,
        connected_at: user.strava_connected_at,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error checking Strava connection:", error);
    return new Response("Something went wrong", { status: 500 });
  }
};
