// Image utilities for bike operations
import cloudinary from "@/config/cloudinary";
import {
  extractPublicIdFromCloudinaryUrl,
  isCloudinaryUrl,
  CLOUDINARY_PRESETS,
} from "@/utils/cloudinaryUtils";

export interface ImageProcessingResult {
  imageUrls: string[];
}

export async function processImageFiles(images: File[]): Promise<string[]> {
  const imageUrls: string[] = [];
  const maxFileSize = 10 * 1024 * 1024; // 10MB limit
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  if (!images || images.length === 0) {
    return imageUrls;
  }

  console.log(`Processing ${images.length} images for upload`);

  for (let index = 0; index < images.length; index++) {
    const imageFile = images[index];
    let retries = 0;

    // Validate file
    if (!imageFile || !(imageFile instanceof File)) {
      console.warn(`Skipping invalid file at index ${index + 1}`);
      continue;
    }

    // Validate file type
    if (!allowedTypes.includes(imageFile.type)) {
      console.warn(
        `Skipping file ${index + 1}: Unsupported file type ${
          imageFile.type
        }. Allowed types: ${allowedTypes.join(", ")}`
      );
      continue;
    }

    // Validate file size
    if (imageFile.size > maxFileSize) {
      console.warn(
        `Skipping file ${index + 1}: File too large (${(
          imageFile.size /
          1024 /
          1024
        ).toFixed(2)}MB). Max size: ${maxFileSize / 1024 / 1024}MB`
      );
      continue;
    }

    // Validate file is not corrupted
    if (imageFile.size === 0) {
      console.warn(`Skipping file ${index + 1}: File is empty`);
      continue;
    }

    while (retries <= maxRetries) {
      try {
        console.log(
          `Uploading image ${index + 1} (File size: ${imageFile.size})${
            retries > 0 ? ` (retry ${retries})` : ""
          }...`
        );

        const imageBuffer = await imageFile.arrayBuffer();

        if (!imageBuffer || imageBuffer.byteLength === 0) {
          throw new Error("Failed to read file buffer");
        }

        const imageArray = Array.from(new Uint8Array(imageBuffer));
        const imageData = Buffer.from(imageArray);
        const imageBase64 = imageData.toString("base64");

        if (!imageBase64) {
          throw new Error("Failed to convert image to base64");
        }

        const result = await cloudinary.uploader.upload(
          `data:${imageFile.type};base64,${imageBase64}`,
          {
            folder: "bike-parts-tracker",
            resource_type: "image",
            timeout: 60000, // 60 second timeout
            retry_delay: 2000, // Cloudinary internal retry delay
            use_filename: false,
            unique_filename: true,
            overwrite: false,
          }
        );

        if (result?.secure_url) {
          imageUrls.push(result.secure_url);
          console.log(
            `✅ Successfully uploaded image ${index + 1}: ${
              result.public_id
            } (${result.bytes} bytes)`
          );
          break; // Success, exit retry loop
        } else {
          throw new Error("No secure URL returned from Cloudinary");
        }
      } catch (error) {
        retries++;
        const isLastRetry = retries > maxRetries;

        if (error instanceof Error) {
          console.error(
            `❌ Image ${index + 1} upload failed${
              isLastRetry ? " (final attempt)" : ` (attempt ${retries})`
            }: ${error.message}`
          );

          // Log specific Cloudinary errors
          if (error.message.includes("timeout")) {
            console.error(
              `Image ${
                index + 1
              }: Upload timed out. File may be too large or connection is slow.`
            );
          } else if (error.message.includes("Invalid image")) {
            console.error(
              `Image ${
                index + 1
              }: File appears to be corrupted or not a valid image.`
            );
            break; // Don't retry for invalid files
          } else if (error.message.includes("File size too large")) {
            console.error(
              `Image ${index + 1}: File exceeds Cloudinary's size limits.`
            );
            break; // Don't retry for oversized files
          } else if (error.message.includes("Rate limit")) {
            console.error(
              `Image ${
                index + 1
              }: Rate limit exceeded. Waiting longer before retry.`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * retries * 2)
            ); // Exponential backoff
          }
        } else {
          console.error(
            `❌ Image ${index + 1} upload failed with unknown error:`,
            error
          );
        }

        if (isLastRetry) {
          console.error(
            `❌ Failed to upload image ${
              index + 1
            } after ${maxRetries} attempts`
          );
        } else {
          // Wait before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * retries)
          );
        }
      }
    }
  }

  const successCount = imageUrls.length;
  const failureCount = images.length - successCount;

  console.log(
    `Upload summary: ${successCount} successful, ${failureCount} failed out of ${images.length} images`
  );

  if (imageUrls.length === 0 && images.length > 0) {
    throw new Error(
      `Failed to upload any images (0/${images.length}). Please check file formats, sizes, and network connection.`
    );
  }

  if (failureCount > 0) {
    console.warn(
      `⚠️ Some images failed to upload (${failureCount}/${images.length}). Proceeding with successfully uploaded images.`
    );
  }

  return imageUrls;
}

export async function processNewBikeImages(
  formData: FormData
): Promise<string[]> {
  const images: File[] = formData
    .getAll("images")
    .filter(
      (image): image is File => image instanceof File && image.size > 0
    ) as File[];

  return await processImageFiles(images);
}

export async function deleteImages(
  oldImages: string[],
  initialImages: string[]
): Promise<void> {
  try {
    const oldImagesArr = oldImages[0]?.split(",") ?? [];
    const initialImagesArr = initialImages[0]?.split(",") ?? [];
    const removedImages = initialImagesArr.filter(
      (image) => !oldImagesArr.includes(image)
    );

    if (removedImages.length === 0) {
      console.log("No images to delete");
      return;
    }

    console.log(
      `Attempting to delete ${removedImages.length} images from Cloudinary`
    );

    for (let index = 0; index < removedImages.length; index++) {
      const removedImage = removedImages[index];

      try {
        if (!removedImage || removedImage.trim() === "") {
          console.warn(`Skipping empty image URL at index ${index}`);
          continue;
        }

        // Use the Cloudinary utilities for better parsing
        if (!isCloudinaryUrl(removedImage)) {
          console.warn(`Skipping non-Cloudinary URL: ${removedImage}`);
          continue;
        }

        const publicId = extractPublicIdFromCloudinaryUrl(removedImage);

        if (!publicId) {
          console.warn(`Could not extract public ID from URL: ${removedImage}`);
          continue;
        }

        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        });

        if (result.result === "ok") {
          console.log(`Successfully deleted image: ${publicId}`);
        } else if (result.result === "not found") {
          console.warn(`Image not found in Cloudinary: ${publicId}`);
        } else {
          console.warn(`Unexpected result when deleting ${publicId}:`, result);
        }
      } catch (error) {
        console.error(`Failed to delete image ${removedImage}:`, error);
        // Continue with other deletions instead of failing completely
        if (error instanceof Error) {
          console.error(`Deletion error: ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.error("Error in deleteImages function:", error);
    // Don't throw here as image deletion failure shouldn't block the main operation
    // The bike update should still succeed even if old images can't be deleted
  }
}

export async function handleImageUpdates(
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
