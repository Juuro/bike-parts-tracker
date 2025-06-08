"use server";
import { authenticateUser } from "@/lib/authUtils";
import { handleImageUpdates } from "@/lib/imageUtils";
import { buildUpdateBikeMutation, executeBikeUpdate } from "@/lib/bikeGraphql";

async function updateBike(formData: FormData): Promise<Bike> {
  try {
    // 1. Authenticate user
    const session = await authenticateUser();

    // 2. Handle image processing
    const { imageUrls } = await handleImageUpdates(formData);

    // 3. Build GraphQL mutation
    const query = buildUpdateBikeMutation(formData, session, imageUrls);

    // 4. Execute update
    const updatedBike = await executeBikeUpdate(query, session.accessToken);

    return updatedBike;
  } catch (error) {
    console.error("Error updating bike:", error);
    throw error;
  }
}

export default updateBike;
