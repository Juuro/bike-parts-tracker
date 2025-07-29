"use server";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function addManufacturer(
  manufacturerName: string,
  manufacturerCountry: string,
  manufacturerUrl: string
): Promise<Manufacturer[]> {
  const session: any = await auth();
  if (!session) {
    console.error("Unauthorized");
  }

  const accessToken = session?.accessToken;

  const query = `
    mutation InsertManufacturer {
      insert_manufacturer(objects: { name: "${manufacturerName}", country: "${manufacturerCountry}", url: "${manufacturerUrl}" }) {
        returning {
          id
          name
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
    console.error("Failed to add manufacturer");
  }

  const result = (await response.json()) as {
    data: { insert_manufacturer: { returning: Manufacturer[] } };
  };
  const {
    insert_manufacturer: { returning: manufacturerResponse },
  } = result.data;

  try {
    revalidatePath(`/`, "layout");
  } catch (error) {
    console.error(error);
  }

  return manufacturerResponse;
}

export default addManufacturer;
