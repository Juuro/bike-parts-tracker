import { auth } from "@/auth";
import { toast } from "react-hot-toast";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const session: any = await auth();
    if (!session) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const userId = session?.userId;
    const accessToken = session?.accessToken;

    const query = `
      query GetUserProfile($userId: uuid!) {
        users(where: { id: { _eq: $userId } }) {
          id
          name
          email
          image
          currency_unit
          weight_unit
          distance_unit
          strava_user
        }
      }
    `;

    const variables = {
      userId: userId,
    };

    const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      toast.error("Failed to fetch user profile");
      console.error("HTTP Error:", response.status, await response.text());
      return new Response("Failed to fetch user profile", {
        status: response.status,
      });
    }

    const result = (await response.json()) as {
      data?: { users: any[] };
      errors?: any[];
    };

    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      return new Response("GraphQL errors occurred", { status: 500 });
    }

    if (!result.data?.users) {
      console.error("No data returned from GraphQL query");
      return new Response("No user data found", { status: 404 });
    }

    const { users } = result.data;

    if (users.length === 0) {
      return new Response("User not found", { status: 404 });
    }

    return new Response(JSON.stringify(users[0]), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("Something went wrong", { status: 500 });
  }
};
