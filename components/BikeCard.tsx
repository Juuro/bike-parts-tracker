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

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:border-blue-200 group cursor-pointer transform hover:scale-105">
      <Link href={`/bikes/${bike.id}`}>
        <div className="aspect-[3/2] relative overflow-hidden">
          {optimizedImageUrl ? (
            <Image
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              src={optimizedImageUrl}
              alt={`${bike.name} bike`}
              fill={true}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Bike
                strokeWidth={1.5}
                size={48}
                className="text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
              />
            </div>
          )}
          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      </Link>

      <div className="p-4">
        <div className="font-bold text-lg mb-1 text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
          <Link href={`/bikes/${bike.id}`} className="line-clamp-1">
            {bike.name}
          </Link>
        </div>
        <p className="text-gray-600 text-sm font-medium">
          <Link
            href={`https://www.strava.com/bikes/${bike.strava_bike}`}
            className="hover:text-blue-600 transition-colors duration-200"
          >
            {bike.discipline.abbr}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default BikeCard;
