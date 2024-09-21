import ListCard from "@/components/ListCard";
import HomeBikes from "@/components/HomeBikes";

export default async function Index() {
  return (
    <section className="bg-slate-50 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
        <HomeBikes />
        <h2 className="text-2xl mb-4">Parts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 rounded-lg">
          <ListCard heading="Recent Parts" />
          <ListCard heading="Parts for sale" />
          <ListCard heading="Maintenance" />
        </div>
      </div>
    </section>
  );
}
