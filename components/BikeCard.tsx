import React from "react";
import Card from "./Card";
import Image from "next/image";
import Link from "next/link";
import { Bike } from "lucide-react";

type BikeCardProps = {
  bike: Bike;
};

const BikeCard: React.FC<BikeCardProps> = ({ bike }) => {
  const images = bike.images?.split(",");

  console.log("images", images);

  return (
    <Card>
      <Link href={`/bikes/${bike.id}`}>
        <div className="aspect-[3/2] relative">
          {images && images[0] ? (
            images[0] && (
              <Image
                className="w-full h-auto object-cover"
                src={images[0]}
                alt=""
                fill={true}
              />
            )
          ) : (
            <Bike
              strokeWidth={2}
              size={110}
              className="w-full h-full bg-gray-200"
              width={790}
            />
          )}
        </div>
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
