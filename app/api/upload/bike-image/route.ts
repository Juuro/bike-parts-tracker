import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import cloudinary from "@/config/cloudinary";
import { CLOUDINARY_PRESETS } from "@/utils/cloudinaryUtils";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the uploaded file from the request
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Please upload JPEG, PNG, or WebP images.",
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Convert file to base64 for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    console.log("Uploading bike image to Cloudinary...");

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload(base64, {
          resource_type: "image",
          transformation: [
            {
              // Apply basic optimization
              quality: "auto:eco",
              fetch_format: "auto",
            },
          ],
          folder: "bike-parts-tracker/bike-images",
          use_filename: true,
          unique_filename: true,
        })
        .then((result) => {
          console.log("Cloudinary upload successful:", result.secure_url);
          resolve(result);
        })
        .catch((error) => {
          console.error("Cloudinary upload error:", error);
          reject(error);
        });
    });

    const result = uploadResult as any;

    return NextResponse.json(
      {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        optimizedUrl: result.secure_url.replace(
          "/upload/",
          `/upload/${CLOUDINARY_PRESETS.BIKE_DETAIL}/`
        ),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Bike image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
