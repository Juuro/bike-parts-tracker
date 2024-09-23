"use server";
import { request, gql } from "graphql-request";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function uninstallInstallation(installationId: string) {
  const session = await auth();

  console.log("deleteInstallation", installationId);

  const accessToken = session?.accessToken;

  const query = gql`
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

  const data = await request(
    process.env.AUTH_HASURA_GRAPHQL_URL!,
    query,
    {},
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

export default uninstallInstallation;
