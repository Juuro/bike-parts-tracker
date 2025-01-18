import { headers } from "next/headers";

const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || null;

const fetchBikes = async () => {
  try {
    const response = await fetch(`${apiDomain}/bikes`, {
      method: "GET",
      headers: new Headers(headers()),
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
      headers: new Headers(headers()),
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
      headers: new Headers(headers()),
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
      headers: new Headers(headers()),
    });
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching bike parts:", error);
    return [];
  }
};

const fetchPartStatus = async () => {
  try {
    const response = await fetch(`${apiDomain}/part_status`, {
      method: "GET",
      headers: new Headers(headers()),
    });
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching part status:", error);
  }
};

export { fetchBikes, fetchBike, fetchBikeParts, fetchParts, fetchPartStatus };
