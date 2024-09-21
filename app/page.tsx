import Link from "next/link";

import { auth } from "@/auth";
import { fetchBikes } from "@/utils/requests";
import BikeCard from "@/components/BikeCard";
import ListCard from "@/components/ListCard";
import Card from "@/components/Card";

export default async function Index() {
  const session = await auth();

  let bikes = [];
  if (session) {
    bikes = await fetchBikes(session);
  }

  return (
    <section className="bg-slate-50 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
        <h2 className="text-2xl mb-4">Bikes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 rounded-lg mb-8">
          {bikes.length === 0 ? (
            <p>No bikes found</p>
          ) : (
            bikes.map((bike) => <BikeCard key={bike.id} bike={bike} />)
          )}
          <Card>
            <Link href="">Add bike +</Link>
          </Card>
        </div>
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
