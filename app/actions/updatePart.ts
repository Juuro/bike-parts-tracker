"use server";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import addManufacturer from "./addManufacturer";

async function updatePart(formData: FormData): Promise<void> {
  const session: any = await auth();
  if (!session) {
    throw new Error("Unauthorized");
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

  // Prepare variables with proper type casting
  const sellPriceValue = formData.get("sell_price");
  const secondhandValue = formData.get("secondhand");
  const yearValue = formData.get("year");
  const priceValue = formData.get("price");
  const weightValue = formData.get("weight");

  const variables = {
    part_id: partId,
    user_id: session?.userId,
    manufacturer_id: manufacturerId as string,
    model_year: yearValue ? parseInt(yearValue as string, 10) : null,
    buy_price: priceValue ? parseFloat(priceValue as string) : null,
    purchase_date: formData.get("purchase_date") as string,
    secondhand: secondhandValue === "true",
    part_status_slug: formData.get("part_status") as string,
    sell_price: sellPriceValue ? parseFloat(sellPriceValue as string) : null,
    shop_url: formData.get("shop_url") as string,
    type_id: formData.get("type") as string,
    weight: weightValue ? parseInt(weightValue as string, 10) : null,
    name: formData.get("name") as string,
  };

  const query = `
    mutation UpdatePart(
      $part_id: uuid!
      $user_id: uuid!
      $manufacturer_id: uuid!
      $model_year: Int
      $buy_price: float8
      $purchase_date: timestamptz!
      $secondhand: Boolean!
      $part_status_slug: String!
      $sell_price: float8
      $shop_url: String!
      $type_id: uuid!
      $weight: Int
      $name: String!
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
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to update part:", errorText);
    throw new Error("Failed to update part");
  }

  const result = await response.json();
  if (result.errors) {
    console.error("GraphQL errors:", result.errors);
    throw new Error("Failed to update part due to GraphQL errors");
  }

  try {
    revalidatePath(`/parts`);
  } catch (error) {
    console.error(error);
  }
}

export default updatePart;
