"use server";
import { auth } from "@/auth";
import cloudinary from "@/config/cloudinary";

async function addBike(formData: FormData): Promise<Bike> {
  const session: any = await auth();
  if (!session) {
    console.error("Unauthorized");
  }

  const accessToken = session?.accessToken;

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

  const query = `
    mutation InsertBike(
      $name: String = ""
      $strava_bike: String = ""
      $ebike: Boolean = false
      $discipline_id: uuid = ""
      $user_id: uuid = ""
      $category_id: uuid = ""
      $images: String = ""
    ) {
      insert_bike(
        objects: {
          name: "${formData.get("name")}", 
          strava_bike: "${formData.get("strava_bike")}", 
          ebike: ${formData.get("ebike") || false}, 
          discipline_id: "${formData.get("discipline")}",
          user_id: "${session?.userId}"
          category_id: "${formData.get("category")}"
          images: "${imageUrls.toString()}"
        }
      ) {
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
    console.error("Failed to add bike");
  }

  const result = (await response.json()) as {
    data: { insert_bike: { returning: Bike[] } };
  };

  const {
    insert_bike: { returning: bikeResponse },
  } = result.data;

  return bikeResponse[0];
}

export default addBike;
