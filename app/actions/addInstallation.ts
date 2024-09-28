"use server";
import fetch from "node-fetch";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function addInstallation(formData: FormData): Promise<void> {
  const session: any = await auth();
  if (!session) {
    console.error("Unauthorized");
  }

  const bikeId = formData.get("bike");
  const accessToken = session?.accessToken;

  const query = `
    mutation AddInstallation {
      insert_installation(
        objects: {
          bike_id: "${bikeId}"
          installed_at: "${formData.get("installed_at")}"
          part: {
            data: {
              manufacturer_id: "${formData.get("manufacturer")}"
              model_year: ${formData.get("year")}
              buy_price: ${formData.get("price")}
              purchase_date: "${formData.get("purchase_date")}"
              secondhand: ${formData.get("secondhand")}
              part_status_slug: "${formData.get("part_status")}"
              sell_price: ${formData.get("sell_price") || null}
              shop_url: "${formData.get("shop_url")}"
              type_id: "${formData.get("type")}"
              user_id: "${session?.userId}"
              weight: ${formData.get("weight")}
              name: "${formData.get("name")}"
            }
          }
        }
      ) {
        returning {
          id
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

  const result = (await response.json()) as {
    data: { part_status: PartStatus[] };
  };

  try {
    await revalidatePath(`/bikes/${bikeId}`, "layout");
  } catch (error) {
    console.error(error);
  }
}

export default addInstallation;
