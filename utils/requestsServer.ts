import { headers } from "next/headers";

const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || null;

// Helper function to make API requests with consistent error handling
const makeApiRequest = async (endpoint: string, errorContext: string) => {
  try {
    const headersList = await headers();
    const response = await fetch(`${apiDomain}${endpoint}`, {
      method: "GET",
      headers: new Headers(headersList),
    });
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${errorContext}:`, error);
    return [];
  }
};

const fetchBikes = async () => {
  return await makeApiRequest("/bikes", "bikes");
};

const fetchParts = async () => {
  return await makeApiRequest("/parts", "parts");
};

const fetchBike = async (bikeId: string) => {
  const data = await makeApiRequest(`/bikes/${bikeId}`, "bike");
  return data.length > 0 ? data[0] : {};
};

const fetchBikeParts = async (bikeId?: string) => {
  if (!bikeId) return [];
  return await makeApiRequest(`/bikes/${bikeId}/installation`, "bike parts");
};

const fetchPartStatus = async () => {
  return await makeApiRequest("/part_status", "part status");
};

const fetchUserProfile = async () => {
  try {
    const headersList = await headers();
    const response = await fetch(`${apiDomain}/user/profile`, {
      method: "GET",
      headers: new Headers(headersList),
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

const fetchManufacturers = async () => {
  return await makeApiRequest("/manufacturers", "manufacturers");
};

const fetchPartsType = async () => {
  return await makeApiRequest("/parts_type", "parts type");
};

const fetchDisciplines = async () => {
  return await makeApiRequest("/disciplines", "disciplines");
};

const fetchCategories = async () => {
  return await makeApiRequest("/categories", "categories");
};

export {
  fetchBikes,
  fetchBike,
  fetchBikeParts,
  fetchParts,
  fetchPartStatus,
  fetchManufacturers,
  fetchPartsType,
  fetchDisciplines,
  fetchCategories,
  fetchUserProfile,
  fetchAvailableUnits,
};
