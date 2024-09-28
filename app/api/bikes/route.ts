import type { NextApiRequest, NextApiResponse } from "next";
import { request, gql } from "graphql-request";
import { auth } from "@/auth"; // Ensure this path is correct

export const GET = async () => {
  try {
    const session = await auth();
    if (!session) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const userId = session.userId;
    const accessToken = session.accessToken;

    const query = gql`
      query GetBikes($id: uuid!) {
        bike(
          where: { user_id: { _eq: $id } }
          order_by: { updated_at: desc_nulls_last }
        ) {
          id
          name
          strava_bike
          discipline {
            abbr
            name
          }
        }
      }
    `;

    const { bike: userResponse } = await request(
      process.env.HASURA_PROJECT_ENDPOINT!,
      query,
      { id: userId },
      {
        authorization: `Bearer ${accessToken}`,
      }
    );

    return new Response(JSON.stringify(userResponse), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("Something went wrong", { status: 500 });
  }
};
