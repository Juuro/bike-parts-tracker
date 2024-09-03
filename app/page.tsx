"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { fetchBikes } from "@/utils/requests";
import BikeCard from "@/components/BikeCard";
import ListCard from "@/components/ListCard";
import Card from "@/components/Card";
const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || null;

export default function Index() {
  const { data: session, status } = useSession();
  const [bikes, setBikes] = useState([]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchBikes(setBikes);
    }
  }, [status]);

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
