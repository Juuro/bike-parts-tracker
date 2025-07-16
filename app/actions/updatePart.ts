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
      $manufacturer_id: uuid
      $model_year: Int
      $buy_price: float8
      $purchase_date: timestamptz
      $secondhand: Boolean
      $part_status_slug: String
      $sell_price: float8
      $shop_url: String
      $type_id: uuid
      $weight: Int
      $name: String
      $part_id: uuid
      $user_id: uuid
    ) {
      update_part(
        where: { id: { _eq: $part_id }, user_id: { _eq: $user_id } }
        _set: {
          manufacturer_id: $manufacturer_id
          model_year: $model_year
          buy_price: $buy_price
          purchase_date: $purchase_date
          secondhand: $secondhand
          part_status_slug: $part_status_slug
          sell_price: $sell_price
          shop_url: $shop_url
          type_id: $type_id
          weight: $weight
          name: $name
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
