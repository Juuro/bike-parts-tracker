import { auth } from "@/auth";
import { fetchBikes } from "@/utils/requestsServer";
import React from "react";
import Card from "./Card";
import BikeCard from "@/components/BikeCard";
import AddBikeModal from "./AddBikeModal";

const HomeBikes = async () => {
  const session = await auth();

  let bikes: Bike[] = [];
  if (session) {
    bikes = await fetchBikes();
  }

  return (
    <section>
      <h2 className="text-2xl mb-4">Bikes</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 rounded-lg mb-8">
        {bikes.length === 0 ? (
          <p>No bikes yet ...</p>
        ) : (
          bikes.map((bike) => <BikeCard key={bike.id} bike={bike} />)
        )}
        <Card>
          <AddBikeModal showCloseButton={true} />
        </Card>
      </div>
    </section>
  );
};

export default HomeBikes;
