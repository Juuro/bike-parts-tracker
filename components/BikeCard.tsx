import React from "react";
import Card from "./Card";
import Image from "next/image";
import Link from "next/link";

const BikeCard = ({ bike }) => {
  return (
    <Card>
      <Image
        className="w-full"
        src={`https://picsum.photos/400/300`}
        alt=""
        width={0}
        height={0}
      />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">
          <Link href={`/bikes/${bike.id}`}>{bike.name}</Link>
        </div>
        <p className="text-gray-700 text-base">
          <Link href={`https://www.strava.com/bikes/${bike.strava_bike}`}>
            {bike.discipline.abbr}
          </Link>
        </p>
      </div>
    </Card>
  );
};

export default BikeCard;
