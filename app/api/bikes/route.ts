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
      query GetBikes {
        bike(
          where: { user_id: { _eq: "${userId}" } }
          order_by: { updated_at: desc_nulls_last }
        ) {
          id
          name
          strava_bike
          discipline {
            abbr
            name
          }
          images
        }
      }
    `;

    const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
      cache: "force-cache",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query }),
    });

    const result = (await response.json()) as {
      data: { bike: Bike[] };
    };
    const { bike: bikeResponse } = result.data;

    return new Response(JSON.stringify(bikeResponse), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("Something went wrong", { status: 500 });
  }
};
