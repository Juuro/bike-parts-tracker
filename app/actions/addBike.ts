"use server";
import { authenticateUser } from "@/lib/authUtils";
import { processNewBikeImages } from "@/lib/imageUtils";
import { buildInsertBikeMutation, executeBikeInsert } from "@/lib/bikeGraphql";

async function addBike(formData: FormData): Promise<Bike> {
  try {
    // 1. Authenticate user
    const session = await authenticateUser();

    // 2. Process images
    const imageUrls = await processNewBikeImages(formData);

    // 3. Build GraphQL mutation
    const query = buildInsertBikeMutation(formData, session, imageUrls);

    // 4. Execute insert
    const newBike = await executeBikeInsert(query, session.accessToken);

    return newBike;
  } catch (error) {
    console.error("Error adding bike:", error);
    throw error;
  }
}

export default addBike;
