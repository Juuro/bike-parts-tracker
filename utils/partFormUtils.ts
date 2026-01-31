import { getCurrencySymbol } from "./profileUtils";

export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

export const formatDateForForm = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;
};

export const getCurrencyLabel = (currencyUnit?: string): string => {
  if (!currencyUnit) return "($)";
  const symbol = getCurrencySymbol(currencyUnit);
  return `(${symbol})`;
};

export const getWeightUnitLabel = (weightUnit?: string): string => {
  if (!weightUnit) return "(g)";
  return `(${weightUnit})`;
};
