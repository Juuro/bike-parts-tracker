"use server";
import { request, gql } from "graphql-request";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { stringToBoolean } from "@/utils/functions";

async function addInstallation(formData) {
  const session = await auth();

  const bikeId = formData.get("bike");
  const userId = session?.userId;

  const accessToken = session?.accessToken;

  const query = gql`
    mutation AddInstallation(
      $bike_id: uuid = ""
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
      $installed_at: timestamptz = ""
    ) {
      insert_installation(
        objects: {
          bike_id: $bike_id
          part: {
            data: {
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
          }
          installed_at: $installed_at
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
      bike_id: bikeId,
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
      installed_at: formData.get("installed_at"),
    },
    {
      authorization: `Bearer ${accessToken}`,
    }
  );

  try {
    await revalidatePath(`/bikes/${bikeId}`, "layout");
  } catch (error) {
    console.error(error);
  }
}

export default addInstallation;
