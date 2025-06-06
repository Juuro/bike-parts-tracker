"use server";
import { auth } from "@/auth";
import cloudinary from "@/config/cloudinary";

async function removeImage(image: string): Promise<void> {
  const session: any = await auth();
  if (!session) {
    console.error("Unauthorized");
  }

  const accessToken = session?.accessToken;

  const publicId = image?.split("/").pop()?.split(".")[0] ?? "";
  const result = await cloudinary.uploader.destroy(
    `bike-parts-tracker/${publicId}`,
    {
      resource_type: "image",
    }
  );
  console.log(result);
}

export default removeImage;
