import React from "react";
import Card from "./Card";
import Image from "next/image";
import Link from "next/link";

type BikeCardProps = {
  bike: Bike;
};

const BikeCard: React.FC<BikeCardProps> = ({ bike }) => {
  const images = bike.images?.split(",");

  return (
    <Card>
      <Link href={`/bikes/${bike.id}`}>
        <Image
          className="w-full"
          src={images ? images[0] : ""}
          alt=""
          width={790}
          height={592}
        />
      </Link>
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
