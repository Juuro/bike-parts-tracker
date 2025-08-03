import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { makeRateLimitedRequest } from "@/lib/rateLimiter";
import { getCachedOrFetch } from "@/lib/cache";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const session = await auth();

    if (!(session as any)?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getCachedOrFetch(
      "manufacturers-list",
      async () => {
        return await makeRateLimitedRequest(async () => {
          const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${(session as any).accessToken}`,
            },
            body: JSON.stringify({
              query: `
                query GetManufacturers {
                  manufacturer(order_by: { name: asc }) {
                    id
                    name
                  }
                }
              `,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (data.errors) {
            throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
          }

          return data;
        });
      },
      5 * 60 * 1000 // Cache for 5 minutes
    );

    return NextResponse.json(result.data.manufacturer);
  } catch (error) {
    console.error("Error in manufacturers API:", error);
    return NextResponse.json(
      { error: "Failed to fetch manufacturers" },
      { status: 500 }
    );
  }
};
