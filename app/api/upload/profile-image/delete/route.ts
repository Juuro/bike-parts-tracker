import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import cloudinary from "@/config/cloudinary";
import { extractPublicIdFromCloudinaryUrl, isCloudinaryUrl } from "@/utils/cloudinaryUtils";

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the image URL from the request body
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL provided" },
        { status: 400 }
      );
    }

    // Extract the public_id from the Cloudinary URL
    const publicId = extractPublicIdFromCloudinaryUrl(imageUrl);
    
    if (!publicId || !isCloudinaryUrl(imageUrl)) {
      // If it's not a Cloudinary URL or can't extract public_id, just return success
      return NextResponse.json({
        success: true,
        message: "External image URL or invalid Cloudinary URL, no deletion needed",
      });
    }
    console.log(
      "Attempting to delete Cloudinary image with public_id:",
      publicId
    );

    // Delete from Cloudinary
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log("Cloudinary deletion result:", result);

      if (result.result === "ok") {
        return NextResponse.json({
          success: true,
          message: "Image deleted successfully from Cloudinary",
        });
      } else if (result.result === "not found") {
        // Image not found in Cloudinary, but that's okay
        return NextResponse.json({
          success: true,
          message:
            "Image not found in Cloudinary (may have been already deleted)",
        });
      } else {
        console.error("Unexpected Cloudinary result:", result);
        return NextResponse.json({
          success: true,
          message: "Image deletion completed with unexpected result",
        });
      }
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion error:", cloudinaryError);
      // Don't fail the entire operation if Cloudinary deletion fails
      return NextResponse.json({
        success: true,
        message: "Database updated, but Cloudinary deletion failed",
      });
    }
  } catch (error) {
    console.error("Profile image deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
