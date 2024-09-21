import { auth } from "@/auth";
import { fetchBikes } from "@/utils/requests";
import React from "react";
import Card from "./Card";
import BikeCard from "@/components/BikeCard";
import Link from "next/link";

const HomeBikes = async () => {
  const session = await auth();

  let bikes: Bike[] = [];
  if (session) {
    bikes = await fetchBikes();
  }

  return (
    <section>
      <h2 className="text-2xl mb-4">Bikes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 rounded-lg mb-8">
        {bikes.length === 0 ? (
          <p>No bikes yet ...</p>
        ) : (
          bikes.map((bike) => <BikeCard key={bike.id} bike={bike} />)
        )}
        <Card>
          <Link href="">Add bike +</Link>
        </Card>
      </div>
    </section>
  );
};

export default HomeBikes;
