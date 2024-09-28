// TODO: Remove this conditional loading of headers()
// Replace with `import { headers } from "next/headers"` as soon as every fetch happens in a server component.
let headers;
if (typeof window === "undefined") {
  headers = (await import("next/headers")).headers;
} else {
  headers = () => ({});
}
// import { headers } from "next/headers";

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

const fetchParts = async () => {
  try {
    const response = await fetch(`${apiDomain}/parts`, {
      method: "GET",
      headers: headers(),
    });
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching parts:", error);
    return [];
  }
};

const fetchBike = async (bikeId: string) => {
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

const fetchBikeParts = async (bikeId?: string) => {
  if (!bikeId) return [];
  try {
    const response = await fetch(`${apiDomain}/bikes/${bikeId}/installation`, {
      method: "GET",
      headers: headers(),
    });
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching bike parts:", error);
    return [];
  }
};

const fetchManufacturers = async () => {
  try {
    const response = await fetch("/api/manufacturers");
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching manufacturers:", error);
  }
};

const fetchPartStatus = async () => {
  try {
    const response = await fetch("/api/part_status");
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sell status:", error);
  }
};

const fetchPartsType = async () => {
  try {
    const response = await fetch("/api/parts_type");
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching part types:", error);
  }
};

export {
  fetchBikes,
  fetchBike,
  fetchBikeParts,
  fetchManufacturers,
  fetchPartStatus,
  fetchPartsType,
  fetchParts,
};
