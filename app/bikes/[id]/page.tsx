import {
  fetchBike,
  fetchBikes,
  fetchManufacturers,
  fetchPartsType,
  fetchPartStatus,
  fetchDisciplines,
  fetchCategories,
} from "@/utils/requestsServer";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import InstallationsTable from "@/components/InstallationsTable";
import AddPartModal from "@/components/AddPartModal";
import EditBikeModal from "@/components/EditBikeModal";
import DeleteBikeModal from "@/components/DeleteBikeModal";
import BikeInfo from "@/components/BikeInfo";
import BikeImageGallery from "@/components/BikeImageGallery";
import { ArrowLeft, Bike } from "lucide-react";
import {
  applyPresetToUrl,
  isCloudinaryUrl,
  CLOUDINARY_PRESETS,
} from "@/utils/cloudinaryUtils";
import Link from "next/link";

const BikePage = async ({ params }: { params: any }) => {
  // Check authentication
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const { id: bikeId } = await params;

  // Fetch all data in parallel for better performance
  const [
    bike,
    bikes,
    manufacturers,
    partsType,
    partStatus,
    disciplines,
    categories,
  ] = await Promise.all([
    fetchBike(bikeId),
    fetchBikes(),
    fetchManufacturers(),
    fetchPartsType(),
    fetchPartStatus(),
    fetchDisciplines(),
    fetchCategories(),
  ]);

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
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="flex items-center space-x-3 mb-4">
            <div className="">
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
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{bike.name}</h1>
          </div>
        </div>

        {/* Main content grid: Images on left, Bike info on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Image gallery - takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <BikeImageGallery
              images={optimizedImages || []}
              bikeName={bike.name}
            />
          </div>

          {/* Bike info - takes up 1 column on large screens */}
          <div className="lg:col-span-1">
            <BikeInfo bike={bike} bikeId={bikeId} categories={categories} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <DeleteBikeModal showCloseButton={true} bike={bike} />
          <EditBikeModal
            showCloseButton={true}
            bike={bike}
            disciplines={disciplines}
            categories={categories}
          />
          <AddPartModal
            showCloseButton={true}
            bike={bike}
            bikes={bikes}
            manufacturers={manufacturers}
            partsType={partsType}
            partStatus={partStatus}
          />
        </div>
        <InstallationsTable
          bikeId={bikeId}
          manufacturers={manufacturers}
          partsType={partsType}
          partStatus={partStatus}
        />
      </div>
    </section>
  );
};

export default BikePage;
