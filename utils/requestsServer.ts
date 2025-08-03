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

const fetchUserProfile = async () => {
  try {
    const response = await fetch(`${apiDomain}/user/profile`, {
      method: "GET",
      headers: new Headers(headers()),
    });
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    // Log detailed error information for debugging
    console.error("Error fetching user profile:", {
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined,
      apiDomain,
      timestamp: new Date().toISOString(),
    });
    return null; // Return null to indicate error state
  }
};

const fetchAvailableUnits = async () => {
  try {
    const query = `
      query GetAvailableUnits {
        currency_unit {
          unit
          label
          symbol
        }
        weight_unit {
          unit
          label
        }
        distance_unit {
          unit
          label
        }
      }
    `;

    const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hasura-Admin-Secret": process.env.HASURA_ADMIN_SECRET!,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error("HTTP Error:", response.status, await response.text());
      throw new Error(`Failed to fetch units: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      throw new Error("GraphQL errors occurred");
    }

    return (
      result.data || {
        currency_unit: [],
        weight_unit: [],
        distance_unit: [],
      }
    );
  } catch (error) {
    console.error("Error fetching available units:", error);
    return {
      currency_unit: [],
      weight_unit: [],
      distance_unit: [],
    };
  }
};

export {
  fetchBikes,
  fetchBike,
  fetchBikeParts,
  fetchParts,
  fetchPartStatus,
  fetchUserProfile,
  fetchAvailableUnits,
};
