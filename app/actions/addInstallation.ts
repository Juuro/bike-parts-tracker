"use server";
import fetch from "node-fetch";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import addManufacturer from "./addManufacturer";

async function addInstallation(formData: FormData): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    console.error("Unauthorized");
    throw new Error("Unauthorized");
    throw new Error("Unauthorized");
  }

  const bikeId = formData.get("bike");
  const accessToken = session.session.token;

  let manufacturerId = formData.get("manufacturer");
  if (formData.get("newManufacturer")) {
    const newManufacturerId = await addManufacturer(
      formData.get("newManufacturer") as string,
      formData.get("manufacturerCountry") as string,
      formData.get("manufacturerUrl") as string
    );

    manufacturerId = newManufacturerId[0].id;
  }

  const query = `
    mutation AddInstallation {
      insert_installation(
        objects: {
          bike_id: "${bikeId}"
          installed_at: "${formData.get("installed_at")}"
          part: {
            data: {
              manufacturer_id: "${manufacturerId}"
              model_year: ${formData.get("year")}
              buy_price: ${formData.get("price")}
              purchase_date: "${formData.get("purchase_date")}"
              secondhand: ${formData.get("secondhand") || false}
              part_status_slug: "${formData.get("part_status")}"
              sell_price: ${formData.get("sell_price") || null}
              shop_url: "${formData.get("shop_url")}"
              type_id: "${formData.get("type")}"
              user_id: "${session.user.id}"
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

  if (!response.ok) {
    console.error("Failed to add installation");
  }

  try {
    revalidatePath(`/bikes/${bikeId}`, "layout");
  } catch (error) {
    console.error(error);
  }
}

export default addInstallation;
