import { auth } from "@/auth";

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
      query GetUserProfile($userId: String!) {
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

    const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query }),
    });

    const result = (await response.json()) as {
      data: { users: any[] };
    };
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
