import { fetchBike, fetchBikes } from "@/utils/requestsServer";
import Image from "next/image";
import InstallationsTable from "@/components/InstallationsTable";
import AddPartModal from "@/components/AddPartModal";
import EditBikeModal from "@/components/EditBikeModal";

const BikePage = async ({ params }: { params: any }) => {
  const { id: bikeId } = params;

  const bike = await fetchBike(bikeId);
  const bikes = await fetchBikes();

  const images = bike.images
    ?.split(",")
    .filter((image: string) => image.length > 0);

  return (
    <section className="bg-slate-50 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start items-center gap-2 mb-6">
          <Image
            src={images ? images[0] : ""}
            className="mr-2 rounded-full object-cover h-12 w-12"
            width={50}
            height={50}
            alt={`${bike.name}`}
          />
          <h1 className="text-4xl font-bold">{bike.name}</h1>
        </div>
        <div className="flex justify-start gap-2 mb-6">
          {images?.map((image: string, index: number) => {
            return (
              <Image
                key={index}
                src={image}
                className="rounded-lg object-cover h-64 w-96"
                width={300}
                height={200}
                alt=""
              />
            );
          })}
        </div>

        <div className="flex justify-end gap-2">
          <EditBikeModal showCloseButton={true} bike={bike} />
          <AddPartModal showCloseButton={true} bike={bike} bikes={bikes} />
        </div>
        <InstallationsTable bikeId={bikeId} />
      </div>
    </section>
  );
};

export default BikePage;
