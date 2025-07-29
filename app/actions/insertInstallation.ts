"use server";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import uninstallInstallation from "./uninstallInstallation";

async function insertInstallation(formData: FormData) {
  const session: any = await auth();
  if (!session) {
    console.error("Unauthorized");
  }

  const accessToken = session?.accessToken;

  const partId = formData.get("part_id");
  const bikeId = formData.get("bike_id");
  const currentInstallationId = formData.get("current_installation_id");

  if (currentInstallationId) {
    await uninstallInstallation(currentInstallationId.toString());
  }

  const query = `
    mutation InsertInstallation($part_id: uuid, $bike_id: uuid) {
      insert_installation(objects: { part_id: "${partId}", bike_id: "${bikeId}" }) {
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
    console.error("Failed to insert installation");
  }

  try {
    revalidatePath(`/`, "layout");
  } catch (error) {
    console.error(error);
  }
}

export default insertInstallation;
