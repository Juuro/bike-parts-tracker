"use server";
import { auth } from "@/auth";
import cloudinary from "@/config/cloudinary";

// Types for better type safety
interface ImageProcessingResult {
  imageUrls: string[];
}

interface AuthSession {
  accessToken: string;
  userId: string;
}

// Authentication helper
async function authenticateUser(): Promise<AuthSession> {
  const session: any = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return {
    accessToken: session.accessToken,
    userId: session.userId,
  };
}

// Image processing functions
async function processImageFiles(images: File[]): Promise<string[]> {
  const imageUrls: string[] = [];

  for (const imageFile of images) {
    const imageBuffer = await imageFile.arrayBuffer();
    const imageArray = Array.from(new Uint8Array(imageBuffer));
    const imageData = Buffer.from(imageArray);
    const imageBase64 = imageData.toString("base64");

    const result = await cloudinary.uploader.upload(
      `data:image/png;base64,${imageBase64}`,
      { folder: "bike-parts-tracker" }
    );

    imageUrls.push(result.secure_url);
  }

  return imageUrls;
}

async function handleImageUpdates(
  formData: FormData
): Promise<ImageProcessingResult> {
  const oldImages = formData.getAll("old_images") as string[];
  const initialImages = formData.getAll("initial_images") as string[];

  // Delete removed images
  await deleteImages(oldImages, initialImages);

  // Process new images
  const images: File[] = formData
    .getAll("images")
    .filter(
      (image): image is File => image instanceof File && image.size > 0
    ) as File[];

  const newImageUrls = await processImageFiles(images);

  // Combine new and existing images
  const allImageUrls =
    oldImages.length > 0 ? [...newImageUrls, ...oldImages] : newImageUrls;

  return { imageUrls: allImageUrls };
}

// GraphQL mutation builder
function buildUpdateBikeMutation(
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

// API call handler
async function executeBikeUpdate(
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

// Image deletion helper (extracted from original)
async function deleteImages(
  oldImages: string[],
  initialImages: string[]
): Promise<void> {
  const oldImagesArr = oldImages[0]?.split(",") ?? [];
  const initialImagesArr = initialImages[0]?.split(",") ?? [];
  const removedImages = initialImagesArr.filter(
    (image) => !oldImagesArr.includes(image)
  );

  for (const removedImage of removedImages) {
    const publicId = removedImage?.split("/").pop()?.split(".")[0] ?? "";

    await cloudinary.uploader.destroy(`bike-parts-tracker/${publicId}`, {
      resource_type: "image",
    });
  }
}

// Main function - now much cleaner and easier to understand
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
