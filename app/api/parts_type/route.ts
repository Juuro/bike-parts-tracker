import type { NextApiRequest, NextApiResponse } from "next";
import { request, gql } from "graphql-request";
import { auth } from "@/auth";

export const GET = async (req) => {
  try {
    const session = await auth();

    const userId = session?.userId;
    const accessToken = session?.accessToken;

    const query = gql`
      query GetPartsType {
        parts_type {
          id
          name
        }
      }
    `;

    const { parts_type: userResponse } = await request(
      process.env.AUTH_HASURA_GRAPHQL_URL!,
      query,
      {},
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
