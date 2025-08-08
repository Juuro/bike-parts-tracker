import { auth } from "@/auth";
import AddPartModal from "@/components/AddPartModal";
import PartsTable from "@/components/PartsTable";
import {
  fetchBikes,
  fetchManufacturers,
  fetchPartsType,
  fetchPartStatus,
} from "@/utils/requestsServer";
import { redirect } from "next/navigation";

const PartsPage = async () => {
  // Check authentication
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  // Fetch all shared data in parallel for better performance
  const [bikes, manufacturers, partsType, partStatus] = await Promise.all([
    fetchBikes(),
    fetchManufacturers(),
    fetchPartsType(),
    fetchPartStatus(),
  ]);

  return (
    <section className="bg-slate-50 flex-1 pt-6 pb-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        <h1 className="text-4xl font-bold mb-6">Your parts</h1>
        <AddPartModal
          showCloseButton={true}
          bikes={bikes}
          manufacturers={manufacturers}
          partsType={partsType}
          partStatus={partStatus}
        />
        <PartsTable
          manufacturers={manufacturers}
          partsType={partsType}
          partStatus={partStatus}
        />
        <AddPartModal
          showCloseButton={true}
          bikes={bikes}
          manufacturers={manufacturers}
          partsType={partsType}
          partStatus={partStatus}
        />
      </div>
    </section>
  );
};

export default PartsPage;
