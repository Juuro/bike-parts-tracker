import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const session: any = await auth();
    if (!session) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const accessToken = session?.accessToken;

    const query = `
      query GetPartsType {
        parts_type(order_by: {name: asc}) {
          id
          name
        }
      }
    `;

    const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
      cache: "force-cache",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (!result.data || !result.data.parts_type) {
      console.error("🔧 Parts Type API - No data returned:", result);
      return new Response(JSON.stringify([]), { status: 200 });
    }

    const { parts_type: partTypeResponse } = result.data;

    console.log("🔧 Parts Type API - returning:", partTypeResponse);
    return new Response(JSON.stringify(partTypeResponse), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("Something went wrong", { status: 500 });
  }
};
