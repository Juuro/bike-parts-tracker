import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export const POST = async () => {
  try {
    const session: any = await auth();
    if (!session?.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Clear Strava data from user profile
    const updateQuery = `
      mutation DisconnectStrava($userId: uuid!) {
        update_users_by_pk(
          pk_columns: { id: $userId }
          _set: {
            strava_id: null
            strava_access_token: null
            strava_refresh_token: null
            strava_expires_at: null
            strava_connected_at: null
            strava_user: null
          }
        ) {
          id
        }
      }
    `;

    const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        query: updateQuery,
        variables: { userId: session.userId },
      }),
    });

    if (!response.ok) {
      console.error("Failed to disconnect Strava:", await response.text());
      return new Response("Failed to disconnect Strava", { status: 500 });
    }

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      return new Response("Failed to disconnect Strava", { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error disconnecting Strava:", error);
    return new Response("Something went wrong", { status: 500 });
  }
};
