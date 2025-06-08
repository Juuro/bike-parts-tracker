// GraphQL utilities for bike operations
import { AuthSession } from "./authUtils";

export function buildUpdateBikeMutation(
  formData: FormData,
  session: AuthSession,
  imageUrls: string[]
): string {
  return `
    mutation UpdateBike {
      update_bike(where: {id: {_eq: "${formData.get("bike_id")}"}}, _set: {
        name: "${formData.get("name")}",
        strava_bike: "${formData.get("strava_bike")}", 
        ebike: ${formData.get("ebike") || false}, 
        discipline_id: "${formData.get("discipline")}",
        user_id: "${session.userId}"
        category_id: "${formData.get("category")}"
        images: "${imageUrls.toString()}"
      }) {
        returning {
          id
        }
      }
    }
  `;
}

export function buildInsertBikeMutation(
  formData: FormData,
  session: AuthSession,
  imageUrls: string[]
): string {
  return `
    mutation InsertBike(
      $name: String = ""
      $strava_bike: String = ""
      $ebike: Boolean = false
      $discipline_id: uuid = ""
      $user_id: uuid = ""
      $category_id: uuid = ""
      $images: String = ""
    ) {
      insert_bike(
        objects: {
          name: "${formData.get("name")}", 
          strava_bike: "${formData.get("strava_bike")}", 
          ebike: ${formData.get("ebike") || false}, 
          discipline_id: "${formData.get("discipline")}",
          user_id: "${session.userId}"
          category_id: "${formData.get("category")}"
          images: "${imageUrls.toString()}"
        }
      ) {
        returning {
          id
        }
      }
    }
  `;
}

export async function executeBikeUpdate(
  query: string,
  accessToken: string
): Promise<Bike> {
  const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error("Failed to update bike");
  }

  const result = (await response.json()) as {
    data: { update_bike: { returning: Bike[] } };
  };

  const {
    update_bike: { returning: bikeResponse },
  } = result.data;

  return bikeResponse[0];
}

export async function executeBikeInsert(
  query: string,
  accessToken: string
): Promise<Bike> {
  const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error("Failed to add bike");
  }

  const result = (await response.json()) as {
    data: { insert_bike: { returning: Bike[] } };
  };

  const {
    insert_bike: { returning: bikeResponse },
  } = result.data;

  return bikeResponse[0];
}
