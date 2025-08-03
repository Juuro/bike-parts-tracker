import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import cloudinary from "@/config/cloudinary";
import {
  extractPublicIdFromCloudinaryUrl,
  isCloudinaryUrl,
} from "@/utils/cloudinaryUtils";

export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the image URL from the request body
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Extract the public_id from the Cloudinary URL
    const publicId = extractPublicIdFromCloudinaryUrl(imageUrl);

    if (!publicId || !isCloudinaryUrl(imageUrl)) {
      // If it's not a Cloudinary URL or can't extract public_id, just return success
      return NextResponse.json(
        {
          success: true,
          message:
            "External image URL or invalid Cloudinary URL, no deletion needed",
        },
        { status: 200 }
      );
    }

    console.log(
      "Attempting to delete Cloudinary bike image with public_id:",
      publicId
    );

    // Delete from Cloudinary
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log("Cloudinary deletion result:", result);

      if (result.result === "ok") {
        return NextResponse.json(
          {
            success: true,
            message: "Bike image deleted successfully from Cloudinary",
          },
          { status: 200 }
        );
      } else if (result.result === "not found") {
        // Image not found in Cloudinary, but that's okay
        return NextResponse.json(
          {
            success: true,
            message:
              "Bike image not found in Cloudinary (may have been already deleted)",
          },
          { status: 200 }
        );
      } else {
        console.error("Unexpected Cloudinary result:", result);
        return NextResponse.json(
          { error: "Unexpected response from Cloudinary" },
          { status: 500 }
        );
      }
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion error:", cloudinaryError);
      return NextResponse.json(
        { error: "Failed to delete image from Cloudinary" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Bike image deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
