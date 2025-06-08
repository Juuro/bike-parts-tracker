"use server";
import { authenticateUser } from "@/lib/authUtils";
import { buildUpdatePartsToNotForSaleMutation, buildDeleteBikeMutation, executeBikeDelete } from "@/lib/bikeGraphql";
import { revalidatePath } from "next/cache";

async function deleteBike(bikeId: string): Promise<void> {
  try {
    // 1. Authenticate user
    const session = await authenticateUser();

    // 2. Update all parts assigned to this bike to "not for sale" status
    const updatePartsQuery = buildUpdatePartsToNotForSaleMutation(bikeId, session);
    await executeBikeDelete(updatePartsQuery, session.accessToken);

    // 3. Delete the bike
    const deleteBikeQuery = buildDeleteBikeMutation(bikeId, session);
    await executeBikeDelete(deleteBikeQuery, session.accessToken);

    // 4. Revalidate paths
    await revalidatePath("/", "layout");
  } catch (error) {
    console.error("Error deleting bike:", error);
    throw error;
  }
}

export default deleteBike;
