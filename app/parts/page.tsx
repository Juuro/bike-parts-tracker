import { auth } from "@/auth";
import AddPartModal from "@/components/AddPartModal";
import PartsTable from "@/components/PartsTable";
import { fetchBikes } from "@/utils/requestsServer";
import { redirect } from "next/navigation";

const PartsPage = async () => {
  const session = await auth();

  const bikes = await fetchBikes();

  if (!session) {
    redirect("/");
  }

  return (
    <section className="bg-slate-50 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-6">Your parts</h1>
        <AddPartModal showCloseButton={true} bikes={bikes} />
        <PartsTable />
        <AddPartModal showCloseButton={true} bikes={bikes} />
      </div>
    </section>
  );
};

export default PartsPage;
