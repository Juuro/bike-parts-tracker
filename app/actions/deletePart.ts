"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function deletePart(partId: string, status: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    console.error("Unauthorized");
    throw new Error("Unauthorized");
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const accessToken = session.session.token;

  const query = `
    mutation SetPartStatusBroken {
      update_part(
        where: { id: { _eq: "${partId}" }, user_id: { _eq: "${userId}" } }
        _set: { part_status_slug: "${status}" }
      ) {
        affected_rows
        returning {
          id
          part_status_slug
        }
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

  if (!response.ok) {
    console.error("Failed to delete part");
  }

  try {
    revalidatePath(`/`, "layout");
  } catch (error) {
    console.error(error);
  }
}

export default deletePart;
