"use server";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function updateUserProfile(formData: FormData): Promise<void> {
  const session: any = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session?.userId;
  const accessToken = session?.accessToken;

  const name = formData.get("name")?.toString() || "";
  const image = formData.get("image")?.toString() || null;
  const weightUnit = formData.get("weight_unit")?.toString() || null;
  const distanceUnit = formData.get("distance_unit")?.toString() || null;
  const currencyUnit = formData.get("currency_unit")?.toString() || null;
  const stravaUser = formData.get("strava_user")?.toString() || null;

  // Use proper GraphQL variables instead of string interpolation
  const query = `
    mutation UpdateUserProfile(
      $userId: uuid!
      $name: String!
      $image: String
      $weight_unit: String
      $distance_unit: String
      $currency_unit: String
      $strava_user: String
    ) {
      update_users(
        where: { id: { _eq: $userId } }
        _set: {
          name: $name
          image: $image
          weight_unit: $weight_unit
          distance_unit: $distance_unit
          currency_unit: $currency_unit
          strava_user: $strava_user
          updated_at: "now()"
        }
      ) {
        affected_rows
        returning {
          id
          name
          image
          weight_unit
          distance_unit
          currency_unit
          strava_user
        }
      }
    }
  `;

  const variables = {
    userId,
    name,
    image: image || null,
    weight_unit: weightUnit || null,
    distance_unit: distanceUnit || null,
    currency_unit: currencyUnit || null,
    strava_user: stravaUser || null,
  };

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
    console.error("HTTP Error:", response.status, errorText);
    throw new Error(`Failed to update user profile: ${response.status}`);
  }

  const result = (await response.json()) as {
    data?: { update_users: { affected_rows: number } };
    errors?: any[];
  };

  if (result.errors) {
    console.error("GraphQL Errors:", result.errors);
    throw new Error(
      `GraphQL errors: ${result.errors.map((e) => e.message).join(", ")}`
    );
  }

  if (!result.data?.update_users) {
    console.error("No data returned from mutation");
    throw new Error("No data returned from update mutation");
  }

  // Revalidate the profile page and layout to show updated data
  revalidatePath("/profile");
  revalidatePath("/", "layout"); // This will revalidate the entire layout including the header
}

export default updateUserProfile;
