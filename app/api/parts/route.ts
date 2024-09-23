import type { NextApiRequest, NextApiResponse } from "next";
import { request, gql } from "graphql-request";
import { auth } from "@/auth"; // Ensure this path is correct

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
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
      query GetParts($id: uuid!) {
        part(
          where: { user_id: { _eq: $id } }
          order_by: { updated_at: desc_nulls_last }
        ) {
          secondhand
          buy_price
          sell_price
          model_year
          weight
          name
          receipt
          shop_url
          created_at
          purchase_date
          updated_at
          id
          manufacturer_id
          sell_status_id
          type_id
          user_id
          manufacturer {
            name
          }
          sell_status {
            name
          }
          parts_type {
            name
          }
          installations(limit: 1, order_by: { installed_at: desc_nulls_last }) {
            id
            bike {
              name
              id
            }
            installed_at
            uninstalled_at
          }
        }
      }
    `;

    const { part: userResponse } = await request(
      process.env.AUTH_HASURA_GRAPHQL_URL!,
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

export { handler as GET, handler as POST };
