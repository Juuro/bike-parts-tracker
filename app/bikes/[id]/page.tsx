import { fetchBike, fetchBikes } from "@/utils/requestsServer";
import Image from "next/image";
import InstallationsTable from "@/components/InstallationsTable";
import AddPartModal from "@/components/AddPartModal";
import EditBikeModal from "@/components/EditBikeModal";

const BikePage = async ({ params }: { params: any }) => {
  const { id: bikeId } = params;

  const bike = await fetchBike(bikeId);
  const bikes = await fetchBikes();

  const images = bike.images?.split(",");

  return (
    <section className="bg-slate-50 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex justify-start items-center gap-2">
            <Image
              src={images ? images[0] : ""}
              className="mr-2 rounded-full"
              width={50}
              height={50}
              alt={`${bike.name}`}
            />
            <h1 className="text-4xl font-bold">{bike.name}</h1>
          </div>
          <div className="flex justify-end items-center gap-2">
            <EditBikeModal showCloseButton={true} bike={bike} />
            <AddPartModal showCloseButton={true} bike={bike} bikes={bikes} />
          </div>
        </div>
        <InstallationsTable bikeId={bikeId} />
      </div>
    </section>
  );
};

export default BikePage;
