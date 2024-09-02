import type { NextApiRequest, NextApiResponse } from "next";
import { request, gql } from "graphql-request";
import { getToken } from "next-auth/jwt";
import { auth } from "@/auth";

export const GET = async (req) => {
  try {
    const { session } = req.auth || {};

    const token = await getToken({ req, secret: process.env.AUTH_SECRET });

    console.log("SESSION: ", session);

    console.log("TOKEN", token);

    const userId = token?.sub;
    const accessToken = token?.accessToken;

    const query = gql`
      query GetUser($id: uuid!) {
        bike(where: { user_id: { _eq: $id } }) {
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
    console.log(error);
    return new Response("Something went wrong", { status: 500 });
  }
};
