import type { NextApiRequest, NextApiResponse } from "next";
import { request, gql } from "graphql-request";
import { auth } from "@/auth";

export const GET = async (req) => {
  try {
    const session = await auth();
    if (!session) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const accessToken = session.accessToken;

    const query = gql`
      query GetUserName($id: uuid!) {
        users_by_pk(id: $id) {
          name
        }
      }
    `;

    const { users_by_pk: user } = await request(
      process.env.HASURA_PROJECT_ENDPOINT!,
      query,
      { id: session.user?.id },
      {
        authorization: `Bearer ${accessToken}`,
      }
    );
    return new Response(JSON.stringify(user), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("Something went wrong", { status: 500 });
  }
};
