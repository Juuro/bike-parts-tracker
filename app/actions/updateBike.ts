"use server";
import { auth } from "@/auth";

async function updateBike(formData: FormData): Promise<Bike> {
  const session: any = await auth();
  if (!session) {
    console.error("Unauthorized");
  }

  const accessToken = session?.accessToken;

  const query = `
    mutation UpdateBike {
      update_bike(where: {id: {_eq: "${formData.get("bike_id")}"}}, _set: {
        name: "${formData.get("name")}",
        strava_bike: "${formData.get("strava_bike")}", 
        ebike: ${formData.get("ebike") || false}, 
        discipline_id: "${formData.get("discipline")}",
        user_id: "${session?.userId}"
        category_id: "${formData.get("category")}"
      }) {
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
    console.error("Failed to update bike");
  }

  const result = (await response.json()) as {
    data: { update_bike: { returning: Bike[] } };
  };

  const {
    update_bike: { returning: bikeResponse },
  } = result.data;

  return bikeResponse[0];
}

export default updateBike;
