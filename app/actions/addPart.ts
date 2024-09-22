"use server";
import { request, gql } from "graphql-request";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { getFormattedTimestamp, stringToBoolean } from "@/utils/functions";

async function addPart(formData) {
  const session = await auth();
  const userId = session?.userId;
  const accessToken = session?.accessToken;

  const query = gql`
    mutation InsertPart(
      $manufacturer_id: uuid = ""
      $model_year: Int = 10
      $buy_price: float8 = ""
      $purchase_date: timestamptz = ""
      $secondhand: Boolean = false
      $sell_status_id: uuid = ""
      $sell_price: float8 = null
      $shop_url: String = ""
      $type_id: uuid = ""
      $user_id: uuid = ""
      $weight: Int = 10
      $name: String = ""
    ) {
      insert_part(
        objects: {
          manufacturer_id: $manufacturer_id
          model_year: $model_year
          buy_price: $buy_price
          purchase_date: $purchase_date
          secondhand: $secondhand
          sell_status_id: $sell_status_id
          sell_price: $sell_price
          shop_url: $shop_url
          type_id: $type_id
          user_id: $user_id
          weight: $weight
          name: $name
        }
      ) {
        returning {
          id
        }
      }
    }
  `;

  const data = await request(
    process.env.AUTH_HASURA_GRAPHQL_URL!,
    query,
    {
      user_id: userId,
      manufacturer_id: formData.get("manufacturer"),
      model_year: parseInt(formData.get("year")),
      buy_price: parseFloat(formData.get("price")),
      purchase_date: formData.get("purchase_date"),
      secondhand: stringToBoolean(formData.get("secondhand")),
      sell_status_id: formData.get("sell_status"),
      shop_url: formData.get("shop_url"),
      type_id: formData.get("type"),
      weight: parseInt(formData.get("weight")),
      name: formData.get("name"),
    },
    {
      authorization: `Bearer ${accessToken}`,
    }
  );

  try {
    await revalidatePath(`/parts`, "layout");
  } catch (error) {
    console.error(error);
  }
}

export default addPart;
