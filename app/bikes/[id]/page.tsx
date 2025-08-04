import { fetchBike, fetchBikes } from "@/utils/requestsServer";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import InstallationsTable from "@/components/InstallationsTable";
import AddPartModal from "@/components/AddPartModal";
import EditBikeModal from "@/components/EditBikeModal";
import DeleteBikeModal from "@/components/DeleteBikeModal";
import { Bike } from "lucide-react";
import {
  applyPresetToUrl,
  isCloudinaryUrl,
  CLOUDINARY_PRESETS,
} from "@/utils/cloudinaryUtils";

const BikePage = async ({ params }: { params: any }) => {
  // Check authentication
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const { id: bikeId } = params;

  const bike = await fetchBike(bikeId);
  const bikes = await fetchBikes();

  const images = bike.images
    ?.split(",")
    .filter((image: string) => image.length > 0);

  // Optimize images for display
  const optimizedImages = images?.map((image: string) =>
    isCloudinaryUrl(image)
      ? applyPresetToUrl(image, CLOUDINARY_PRESETS.BIKE_DETAIL)
      : image
  );

  const thumbnailImage =
    images?.[0] && isCloudinaryUrl(images[0])
      ? applyPresetToUrl(images[0], CLOUDINARY_PRESETS.BIKE_THUMBNAIL)
      : images?.[0];

  return (
    <section className="bg-slate-50 flex-1 pt-6 pb-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-start items-center gap-2 mb-6">
          {thumbnailImage ? (
            <Image
              src={thumbnailImage}
              className="mr-2 rounded-full object-cover h-12 w-12"
              width={50}
              height={50}
              alt={`${bike.name}`}
            />
          ) : (
            <Bike
              strokeWidth={2}
              size={5}
              className="mr-2 rounded-full object-cover h-12 w-12 bg-gray-200"
            />
          )}

          <h1 className="text-4xl font-bold">{bike.name}</h1>
        </div>
        <div className="gap-2 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] rounded-lg mb-6">
          {optimizedImages?.map((image: string, index: number) => {
            return (
              <div
                key={index}
                className="h-48 w-full overflow-hidden rounded-lg"
              >
                <Image
                  src={image}
                  width={300}
                  height={200}
                  alt={`Bike image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2">
          <DeleteBikeModal showCloseButton={true} bike={bike} />
          <EditBikeModal showCloseButton={true} bike={bike} />
          <AddPartModal showCloseButton={true} bike={bike} bikes={bikes} />
        </div>
        <InstallationsTable bikeId={bikeId} />
      </div>
    </section>
  );
};

export default BikePage;
