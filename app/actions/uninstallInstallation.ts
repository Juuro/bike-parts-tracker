"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function uninstallInstallation(installationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    console.error("Unauthorized");
    throw new Error("Unauthorized");
    throw new Error("Unauthorized");
  }

  const accessToken = session.session.token;

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

  if (!response.ok) {
    console.error("Failed to uninstall installation");
  }

  try {
    revalidatePath(`/`, "layout");
  } catch (error) {
    console.error(error);
  }
}

export default uninstallInstallation;
