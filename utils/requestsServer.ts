import { headers } from "next/headers";

const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || null;

const fetchBikes = async () => {
  console.log(
    "process.env.NEXT_PUBLIC_API_DOMAIN:",
    process.env.NEXT_PUBLIC_API_DOMAIN
  );
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

export { fetchBikes, fetchBike, fetchBikeParts, fetchParts };
