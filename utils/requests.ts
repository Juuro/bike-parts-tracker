// TODO: Remove this conditional loading of headers()
// Replace with `import { headers } from "next/headers"` as soon as every fetch happens in a server component.
let headers;
if (typeof window === "undefined") {
  headers = (await import("next/headers")).headers;
}

const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || null;

const fetchBikes = async () => {
  try {
    const response = await fetch(`${apiDomain}/bikes`, {
      method: "GET",
      headers: headers(),
    });
    if (!response.ok) throw new Error("Failed to fetch");
    const data: Bike[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching bikes:", error);
    return [];
  }
};

const fetchBike = async (bikeId) => {
  try {
    const response = await fetch(`${apiDomain}/bikes/${bikeId}`, {
      method: "GET",
      headers: headers(),
    });
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("Error fetching bike:", error);
    return {};
  }
};

const fetchBikeParts = async (bikeId) => {
  try {
    const response = await fetch(`${apiDomain}/bikes/${bikeId}/installation`, {
      method: "GET",
      headers: headers(),
    });
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    console.log("Part: ", data);
    return data;
  } catch (error) {
    console.error("Error fetching parts:", error);
    return [];
  }
};

const fetchManufacturers = async (setManufacturers) => {
  try {
    const response = await fetch("/api/manufacturers");
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    setManufacturers(data);
  } catch (error) {
    console.error("Error fetching manufacturers:", error);
  }
};

const fetchSellStatus = async (setSellStatus) => {
  try {
    const response = await fetch("/api/sell_status");
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    setSellStatus(data);
  } catch (error) {
    console.error("Error fetching sell status:", error);
  }
};

const fetchPartsType = async (setPartsType) => {
  try {
    const response = await fetch("/api/parts_type");
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    setPartsType(data);
  } catch (error) {
    console.error("Error fetching part types:", error);
  }
};

export {
  fetchBikes,
  fetchBike,
  fetchBikeParts,
  fetchManufacturers,
  fetchSellStatus,
  fetchPartsType,
};
