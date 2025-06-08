"use server";
import { auth } from "@/auth";
import cloudinary from "@/config/cloudinary";

interface AuthSession {
  accessToken: string;
  userId: string;
}

class BikeUpdateService {
  private session: AuthSession | null = null;

  async authenticate(): Promise<void> {
    const session: any = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }
    this.session = {
      accessToken: session.accessToken,
      userId: session.userId,
    };
  }

  async processImages(images: File[]): Promise<string[]> {
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

  async deleteRemovedImages(
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

  async handleImageUpdates(formData: FormData): Promise<string[]> {
    const oldImages = formData.getAll("old_images") as string[];
    const initialImages = formData.getAll("initial_images") as string[];

    await this.deleteRemovedImages(oldImages, initialImages);

    const images: File[] = formData
      .getAll("images")
      .filter(
        (image): image is File => image instanceof File && image.size > 0
      ) as File[];

    const newImageUrls = await this.processImages(images);

    return oldImages.length > 0
      ? [...newImageUrls, ...oldImages]
      : newImageUrls;
  }

  buildMutation(formData: FormData, imageUrls: string[]): string {
    if (!this.session) {
      throw new Error("User not authenticated");
    }

    return `
      mutation UpdateBike {
        update_bike(where: {id: {_eq: "${formData.get("bike_id")}"}}, _set: {
          name: "${formData.get("name")}",
          strava_bike: "${formData.get("strava_bike")}", 
          ebike: ${formData.get("ebike") || false}, 
          discipline_id: "${formData.get("discipline")}",
          user_id: "${this.session.userId}"
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

  async executeUpdate(query: string): Promise<Bike> {
    if (!this.session) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.session.accessToken}`,
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

  async updateBike(formData: FormData): Promise<Bike> {
    await this.authenticate();
    const imageUrls = await this.handleImageUpdates(formData);
    const query = this.buildMutation(formData, imageUrls);
    return await this.executeUpdate(query);
  }
}

async function updateBike(formData: FormData): Promise<Bike> {
  const service = new BikeUpdateService();
  return await service.updateBike(formData);
}

export default updateBike;
