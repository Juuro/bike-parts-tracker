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

export function buildDeleteBikeMutation(
  bikeId: string,
  session: AuthSession
): string {
  return `
    mutation DeleteBike {
      delete_bike(
        where: { 
          id: { _eq: "${bikeId}" }, 
          user_id: { _eq: "${session.userId}" } 
        }
      ) {
        affected_rows
      }
    }
  `;
}

export function buildUpdatePartsToNotForSaleMutation(
  bikeId: string,
  session: AuthSession
): string {
  return `
    mutation UpdatePartsToNotForSale {
      update_part(
        where: { 
          installations: { 
            bike_id: { _eq: "${bikeId}" }, 
            uninstalled_at: { _is_null: true } 
          },
          user_id: { _eq: "${session.userId}" }
        }
        _set: { part_status_slug: "not-for-sale" }
      ) {
        affected_rows
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

export async function executeBikeDelete(
  query: string,
  accessToken: string
): Promise<number> {
  const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error("Failed to execute delete operation");
  }

  const result = (await response.json()) as {
    data: { delete_bike?: { affected_rows: number }; update_part?: { affected_rows: number } };
  };

  return result.data.delete_bike?.affected_rows || result.data.update_part?.affected_rows || 0;
}
