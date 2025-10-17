import { auth } from "@/auth";
import { NextResponse } from "next/server";

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
      query GetManufacturers {
        manufacturer(order_by: {name: asc}) {
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
        "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET!,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    return NextResponse.json(result.data.manufacturer);
  } catch (error) {
    console.error(error);
    return new Response("Something went wrong", { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const session: any = await auth();
    if (!session) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const { name, country, url } = await request.json();

    if (!name || !country) {
      return new Response("Name and country are required", {
        status: 400,
      });
    }

    const accessToken = session?.accessToken;

    const mutation = `
      mutation AddManufacturer($name: String!, $country: String!, $url: String) {
        insert_manufacturer_one(object: {
          name: $name,
          country: $country,
          url: $url
        }) {
          id
          name
          country
          url
        }
      }
    `;

    const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET!,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          name,
          country,
          url: url || null,
        },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      return new Response("Failed to add manufacturer", { status: 500 });
    }

    return NextResponse.json(result.data.insert_manufacturer_one);
  } catch (error) {
    console.error("Error adding manufacturer:", error);
    return new Response("Something went wrong", { status: 500 });
  }
};
