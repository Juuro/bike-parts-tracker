"use server";
import { auth } from "@/auth";
import cloudinary from "@/config/cloudinary";

async function updateBike(formData: FormData): Promise<Bike> {
  const session: any = await auth();
  if (!session) {
    console.error("Unauthorized");
  }

  const accessToken = session?.accessToken;

  const oldImages = formData.getAll("old_images") as string[];

  const images: File[] = formData
    .getAll("images")
    .filter(
      (image): image is File => image instanceof File && image.size > 0
    ) as File[];

  const imageUrls = [];

  for (const imageFile of images) {
    console.log("imageFile", imageFile);
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

  if (oldImages.length > 0) {
    imageUrls.push(...oldImages);
  }

  const query = `
    mutation UpdateBike {
      update_bike(where: {id: {_eq: "${formData.get("bike_id")}"}}, _set: {
        name: "${formData.get("name")}",
        strava_bike: "${formData.get("strava_bike")}", 
        ebike: ${formData.get("ebike") || false}, 
        discipline_id: "${formData.get("discipline")}",
        user_id: "${session?.userId}"
        category_id: "${formData.get("category")}"
          images: "${imageUrls.toString()}"
      }) {
        returning {
          id
        }
      }
    }
  `;

  const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    console.error("Failed to update bike");
  }

  const result = (await response.json()) as {
    data: { update_bike: { returning: Bike[] } };
  };

  const {
    update_bike: { returning: bikeResponse },
  } = result.data;

  return bikeResponse[0];
}

export default updateBike;
