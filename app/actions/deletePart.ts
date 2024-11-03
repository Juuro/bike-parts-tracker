"use server";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function deletePart(partId: string, status: string): Promise<void> {
  const session: any = await auth();
  if (!session) {
    console.error("Unauthorized");
  }

  const userId = session?.userId;
  const accessToken = session?.accessToken;

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
    await revalidatePath(`/`, "layout");
  } catch (error) {
    console.error(error);
  }
}

export default deletePart;
