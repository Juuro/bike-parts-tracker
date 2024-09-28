"use server";
import { request, gql } from "graphql-request";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import uninstallInstallation from "./uninstallInstallation";

async function insertInstallation(formData: FormData) {
  const session = await auth();

  const partId = formData.get("part_id");
  const bikeId = formData.get("bike_id");
  const currentInstallationId = formData.get("current_installation_id");

  if (currentInstallationId) {
    await uninstallInstallation(currentInstallationId.toString());
  }

  const accessToken = session?.accessToken;

  const query = gql`
    mutation InsertInstallation($part_id: uuid, $bike_id: uuid) {
      insert_installation(objects: { part_id: $part_id, bike_id: $bike_id }) {
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

  const data = await request(
    process.env.HASURA_PROJECT_ENDPOINT!,
    query,
    {
      part_id: partId,
      bike_id: bikeId,
    },
    {
      authorization: `Bearer ${accessToken}`,
    }
  );

  console.log("data: ", data);

  try {
    await revalidatePath(`/`, "layout");
  } catch (error) {
    console.error(error);
  }
}

export default insertInstallation;
