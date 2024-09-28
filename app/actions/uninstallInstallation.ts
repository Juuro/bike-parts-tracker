"use server";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function uninstallInstallation(installationId: string) {
  const session: any = await auth();
  if (!session) {
    console.error("Unauthorized");
  }

  const accessToken = session?.accessToken;

  const query = `
    mutation UninstallInstallation {
      update_installation(
        where: { id: { _eq: "${installationId}" }, uninstalled_at: { _is_null: true } }
        _set: { uninstalled_at: "now()" }
      ) {
        affected_rows
        returning {
          id
          part_id
          bike_id
          installed_at
          uninstalled_at
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

  try {
    await revalidatePath(`/`, "layout");
  } catch (error) {
    console.error(error);
  }
}

export default uninstallInstallation;
