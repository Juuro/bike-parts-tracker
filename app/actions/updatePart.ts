"use server";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import addManufacturer from "./addManufacturer";

async function updatePart(formData: FormData): Promise<void> {
  const session: any = await auth();
  if (!session) {
    console.error("Unauthorized");
  }

  const accessToken = session?.accessToken;
  const partId = formData.get("part_id") as string;

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
    mutation UpdatePart(
      $manufacturer_id: uuid = ""
      $model_year: Int = 10
      $buy_price: float8 = ""
      $purchase_date: timestamptz = ""
      $secondhand: Boolean = false
      $part_status_slug: String = ""
      $sell_price: float8 = null
      $shop_url: String = ""
      $type_id: uuid = ""
      $weight: Int = 10
      $name: String = ""
      $part_id: uuid = ""
    ) {
      update_part(
        where: { id: { _eq: "${partId}" }, user_id: { _eq: "${session?.userId}" } }
        _set: {
          manufacturer_id: "${manufacturerId}"
          model_year: ${formData.get("year")}
          buy_price: ${formData.get("price")}
          purchase_date: "${formData.get("purchase_date")}"
          secondhand: ${formData.get("secondhand") || false}
          part_status_slug: "${formData.get("part_status")}"
          sell_price: ${formData.get("sell_price") || null}
          shop_url: "${formData.get("shop_url")}"
          type_id: "${formData.get("type")}"
          weight: ${formData.get("weight")}
          name: "${formData.get("name")}"
        }
      ) {
        affected_rows
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
    console.error("Failed to update part");
  }

  try {
    await revalidatePath(`/parts`, "layout");
  } catch (error) {
    console.error(error);
  }
}

export default updatePart;
