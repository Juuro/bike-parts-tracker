import React from "react";
import Card from "./Card";
import Image from "next/image";
import Link from "next/link";
import { Bike } from "lucide-react";
import {
  applyPresetToUrl,
  isCloudinaryUrl,
  CLOUDINARY_PRESETS,
} from "@/utils/cloudinaryUtils";

type BikeCardProps = {
  bike: Bike;
};

const BikeCard: React.FC<BikeCardProps> = ({ bike }) => {
  const images = bike.images?.split(",");

  // Optimize the first image if it's from Cloudinary
  const optimizedImageUrl =
    images?.[0] && isCloudinaryUrl(images[0])
      ? applyPresetToUrl(images[0], CLOUDINARY_PRESETS.BIKE_CARD)
      : images?.[0];

  console.log("images", images);

  return (
    <Card>
      <Link href={`/bikes/${bike.id}`}>
        <div className="aspect-[3/2] relative">
          {optimizedImageUrl ? (
            <Image
              className="w-full h-auto object-cover"
              src={optimizedImageUrl}
              alt={`${bike.name} bike`}
              fill={true}
            />
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
