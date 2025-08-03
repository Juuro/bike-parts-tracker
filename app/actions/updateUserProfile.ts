"use server";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logSessionCacheInvalidationRequest } from "@/utils/sessionCache";

async function updateUserProfile(formData: FormData): Promise<void> {
  const session: any = await auth();
  if (!session) {
    console.error("No session found");
    throw new Error("Unauthorized");
  }

  const userId = session?.userId;
  const accessToken = session?.accessToken;

  if (!userId) {
    console.error("No userId in session:", session);
    throw new Error("User ID not found in session");
  }

  if (!accessToken) {
    console.error("No accessToken in session:", session);
    throw new Error("Access token not found in session");
  }

  const name = formData.get("name")?.toString() || "";
  const imageRaw = formData.get("image")?.toString() || "";
  const image = imageRaw.trim() === "" ? null : imageRaw; // Convert empty string to null
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
    image: image, // Pass null directly, don't convert to empty string
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
    console.error("Request headers:", {
      Authorization: `Bearer ${accessToken?.substring(0, 20)}...`,
      "Content-Type": "application/json",
    });
    console.error("Request variables:", variables);
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

  console.log("Profile updated successfully:", result.data.update_users);

  // Log session cache invalidation request (note: doesn't actually invalidate)
  await logSessionCacheInvalidationRequest();

  // Revalidate the profile page and layout to show updated data
  revalidatePath("/profile");
  revalidatePath("/"); // Revalidate the home page to refresh header/navigation
  revalidatePath("/layout"); // Try to refresh any cached layout data
}

export default updateUserProfile;
