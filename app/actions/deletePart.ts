"use server";
import { request, gql } from "graphql-request";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function deletePart(partId: string) {
  const session = await auth();

  const userId = session?.userId;

  const accessToken = session?.accessToken;

  const query = gql`
    mutation SetPartStatusBroken {
      update_part(
        where: { id: { _eq: "${partId}" }, user_id: { _eq: "${userId}" } }
        _set: { part_status_slug: "broken" }
      ) {
        affected_rows
        returning {
          id
          part_status_slug
        }
      }
    }
  `;

  const data = await request(
    process.env.AUTH_HASURA_GRAPHQL_URL!,
    query,
    {},
    {
      authorization: `Bearer ${accessToken}`,
    }
  );

  try {
    await revalidatePath(`/`, "layout");
  } catch (error) {
    console.error(error);
  }
}

export default deletePart;
