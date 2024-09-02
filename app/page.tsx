"use client";
import CustomLink from "@/components/custom-link";
import { auth } from "@/auth";
import BikeCard from "@/components/BikeCard";
import ListCard from "@/components/ListCard";
import { fetchBikes } from "@/utils/requests";
const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || null;
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Index() {
  const { data: session, status } = useSession();
  const [bikes, setBikes] = useState([]);
  // const response = await fetch(`${apiDomain}/bikes`, {
  //   credentials: "include",
  // });

  useEffect(() => {
    console.log("STATUS: ", status);
    if (status === "authenticated") {
      fetchBikes();
    }
  }, [status]);

  console.log("BIKES: ", bikes);

  const fetchBikes = async () => {
    try {
      const response = await fetch("/api/bikes");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setBikes(data);
    } catch (error) {
      console.error("Error fetching bikes:", error);
    }
  };

  return (
    <>
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl mb-4">Bikes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 rounded-lg mb-8">
            {bikes.length === 0 ? (
              <p>No bikes found</p>
            ) : (
              bikes.map((bike) => <BikeCard key={bike.id} bike={bike} />)
            )}
          </div>
          <h2 className="text-2xl mb-4">Parts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 rounded-lg">
            <ListCard heading="Recent Parts" />
            <ListCard heading="Parts for sale" />
            <ListCard heading="Maintenance" />
          </div>
        </div>
      </section>
    </>
  );
}
