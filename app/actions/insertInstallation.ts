"use server";
import { request, gql } from "graphql-request";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function insertInstallation(formData: FormData) {
  const session: any = await auth();

  console.log("insertInstallation", formData);

  const partId = formData.get("part_id");
  const bikeId = formData.get("bike_id");

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
    process.env.AUTH_HASURA_GRAPHQL_URL!,
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
