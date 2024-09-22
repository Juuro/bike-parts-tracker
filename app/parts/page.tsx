import AddPartModal from "@/components/AddPartModal";
import PartsTable from "@/components/PartsTable";

const PartsPage = () => {
  return (
    <section className="bg-slate-50 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-6">Your parts</h1>
        <AddPartModal showCloseButton={true} />
        <PartsTable />
        <AddPartModal showCloseButton={true} />
      </div>
    </section>
  );
};

export default PartsPage;
