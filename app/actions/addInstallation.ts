"use server";
import { request, gql } from "graphql-request";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { stringToBoolean } from "@/utils/functions";

async function addInstallation(formData) {
  const session = await auth();

  console.log("Form Data: ", formData);

  const userId = "369b5e55-7e2b-4c81-b6d0-bdc7ff6a7445";
  const bikeId = "12072258-daef-4354-bce8-7adb7e37c8d5";

  const accessToken = session?.accessToken;

  const query = gql`
    mutation MyMutation(
      $bike_id: uuid = ""
      $manufacturer_id: uuid = ""
      $model_year: Int = 10
      $buy_price: float8 = ""
      $purchase_date: timestamptz = ""
      $secondhand: Boolean = false
      $sell_status_id: uuid = ""
      $sell_price: float8 = ""
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

  // const data = await request(
  //   process.env.AUTH_HASURA_GRAPHQL_URL!,
  //   query,
  //   {
  //     user_id: userId,
  //     bike_id: formData.get("bike"),
  //     manufacturer_id: "e8fd544f-1434-4ab3-b142-97c2198b8c4a",
  //     model_year: formData.get("year"),
  //     buy_price: formData.get("price"),
  //     purchase_date: formData.get("purchase_date"),
  //     secondhand: stringToBoolean(formData.get("secondhand")),
  //     sell_status_id: "3e25ac79-5efe-4704-9324-9f3f211d3e05",
  //     shop_url: formData.get("shop_url"),
  //     type_id: "97021dba-dea7-4652-afc8-7c93d151d181",
  //     weight: formData.get("weight"),
  //     name: formData.get("name"),
  //     installed_at: formData.get("installed_at"),
  //   },
  //   {
  //     authorization: `Bearer ${accessToken}`,
  //   }
  // );

  // console.log("HALLO", data.insert_installation.returning);
  try {
    revalidatePath(`/bikes/${bikeId}`);
    console.log(`Revalidation triggered for /bikes/${bikeId}`);
  } catch (error) {
    console.error("Revalidation error:", error);
  }
}

export default addInstallation;
