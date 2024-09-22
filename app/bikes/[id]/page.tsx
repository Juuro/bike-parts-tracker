import Link from "next/link";
import { fetchBike, fetchBikeParts } from "@/utils/requests";
import DeletePartButton from "@/components/DeletePartButton";
import DeleteInstallationButton from "@/components/DeleteInstallationButton";
import AddPartModal from "@/components/AddPartModal";
import PartsTable from "@/components/ui/table";

const BikePage = async ({ params }) => {
  const { id: bikeId } = params;

  const bike = await fetchBike(bikeId);
  const bikeParts = await fetchBikeParts(bikeId);

  return (
    <section className="bg-slate-50 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-6">{bike.name}</h1>
        <AddPartModal showCloseButton={true} bike={bike} />
        <PartsTable bikeName={bike.name} bikeId={bikeId} />
        {/* TODO: calculated weight, measured weight */}
        <AddPartModal showCloseButton={true} bike={bike} />
      </div>
    </section>
  );
};

export default BikePage;
