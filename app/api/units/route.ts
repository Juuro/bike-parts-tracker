import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const session: any = await auth();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const accessToken = session?.accessToken;

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
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error("HTTP Error:", response.status, await response.text());
      return new Response("Failed to fetch available units", {
        status: response.status,
      });
    }

    const result = (await response.json()) as {
      data?: {
        currency_unit: Array<{ unit: string; label: string; symbol: string }>;
        weight_unit: Array<{ unit: string; label: string }>;
        distance_unit: Array<{ unit: string; label: string }>;
      };
      errors?: any[];
    };

    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      return new Response("GraphQL errors occurred", { status: 500 });
    }

    if (!result.data) {
      console.error("No data returned from GraphQL query");
      return new Response("No unit data found", { status: 404 });
    }

    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching available units:", error);
    return new Response("Something went wrong", { status: 500 });
  }
};
