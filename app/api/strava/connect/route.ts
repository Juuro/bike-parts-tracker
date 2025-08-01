import { auth } from "@/auth";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export const POST = async (request: NextRequest) => {
  try {
    const session: any = await auth();
    if (!session?.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { code, state } = await request.json();

    if (!code) {
      return new Response("Authorization code is required", { status: 400 });
    }

    // Exchange authorization code for access token
    const tokenParams = new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID!,
      client_secret: process.env.STRAVA_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
    });

    const tokenResponse = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Failed to exchange code for token:", errorText);
      console.error("Response status:", tokenResponse.status);
      return new Response(
        `Failed to exchange authorization code: ${errorText}`,
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_at, athlete } = tokenData;

    // Update user with Strava data
    const updateQuery = `
      mutation UpdateUserStravaData(
        $userId: uuid!
        $stravaId: String!
        $stravaAccessToken: String!
        $stravaRefreshToken: String!
        $stravaExpiresAt: bigint!
        $stravaUser: String!
      ) {
        update_users_by_pk(
          pk_columns: { id: $userId }
          _set: {
            strava_id: $stravaId
            strava_access_token: $stravaAccessToken
            strava_refresh_token: $stravaRefreshToken
            strava_expires_at: $stravaExpiresAt
            strava_user: $stravaUser
            strava_connected_at: "now()"
          }
        ) {
          id
          strava_id
          strava_user
          strava_connected_at
        }
      }
    `;

    const updateResponse = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        query: updateQuery,
        variables: {
          userId: session.userId,
          stravaId: athlete.id.toString(),
          stravaAccessToken: access_token,
          stravaRefreshToken: refresh_token,
          stravaExpiresAt: expires_at,
          stravaUser:
            athlete.username || `${athlete.firstname}_${athlete.lastname}`,
        },
      }),
    });

    if (!updateResponse.ok) {
      console.error(
        "Failed to update user with Strava data:",
        await updateResponse.text()
      );
      return new Response("Failed to save Strava connection", { status: 500 });
    }

    const updateResult = await updateResponse.json();

    if (updateResult.errors) {
      console.error("GraphQL errors:", updateResult.errors);
      return new Response("Failed to save Strava connection", { status: 500 });
    }

    return new Response(
      JSON.stringify({
        success: true,
        athlete: {
          id: athlete.id,
          username: athlete.username,
          name: `${athlete.firstname} ${athlete.lastname}`,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in Strava connect:", error);
    return new Response("Something went wrong", { status: 500 });
  }
};
