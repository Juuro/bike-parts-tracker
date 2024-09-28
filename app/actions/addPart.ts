"use server";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function addPart(formData: FormData): Promise<void> {
  const session: any = await auth();
  if (!session) {
    console.error("Unauthorized");
  }

  const bikeId = formData.get("bike");
  const accessToken = session?.accessToken;

  const query = `
    mutation InsertPart(
      $manufacturer_id: uuid = ""
      $model_year: Int = 10
      $buy_price: float8 = ""
      $purchase_date: timestamptz = ""
      $secondhand: Boolean = false
      $part_status_slug: String = ""
      $sell_price: float8 = null
      $shop_url: String = ""
      $type_id: uuid = ""
      $user_id: uuid = ""
      $weight: Int = 10
      $name: String = ""
    ) {
      insert_part(
        objects: {
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

  try {
    await revalidatePath(`/parts`, "layout");
  } catch (error) {
    console.error(error);
  }
}

export default addPart;
