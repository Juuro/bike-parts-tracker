import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getFormattedTimestamp = (): string => {
  const currentDate = new Date();
  const isoString = currentDate.toISOString();
  return isoString.replace("Z", "+00:00");
};


const stringToBoolean = (string: string): boolean => {
  if (string === "true") {
    return true;
  }
  return false;
};

export { stringToBoolean, getFormattedTimestamp };
