import type { NextApiRequest, NextApiResponse } from "next";
import { request, gql } from "graphql-request";
import { getToken } from "next-auth/jwt";
import { auth } from "@/auth";

export const GET = async (req, { params }) => {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });

    const userId = token?.sub;
    const accessToken = token?.accessToken;

    const query = gql`
      query GetInstallation($bike_id: uuid!) {
        installation(where: { bike_id: { _eq: $bike_id } }) {
          id
          part {
            id
            buy_price
            model_year
            name
            purchase_date
            receipt
            secondhand
            sell_price
            shop_url
            updated_at
            user_id
            weight
            manufacturer {
              name
            }
            sell_status {
              name
            }
            parts_type {
              name
            }
            installations {
              id
              uninstalled_at
              part {
                id
              }
              bike {
                id
                name
              }
            }
          }
          installed_at
          uninstalled_at
          bike {
            id
            name
          }
        }
      }
    `;

    const { installation: userResponse } = await request(
      process.env.AUTH_HASURA_GRAPHQL_URL!,
      query,
      { bike_id: params.id },
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
