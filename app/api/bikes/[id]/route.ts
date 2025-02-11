import { auth } from "@/auth";

export const GET = async (req: Request, { params }: { params: any }) => {
  try {
    const session: any = await auth();
    if (!session) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const accessToken = session?.accessToken;
    const userId = session?.userId;
    const bikeId = params.id;

    const query = `
      query GetBike {
        bike(
          where: { user_id: { _eq: "${userId}" }, id: { _eq: "${bikeId}" } }
          limit: 1
        ) {
          id
          name
          strava_bike
          discipline {
            id
            name
          }
          category_id
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
