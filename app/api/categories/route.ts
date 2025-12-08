import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const accessToken = session.session.token;

    const query = `
      query GetCategories {
        category(order_by: {name: asc}) {
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

    const result = (await response.json()) as {
      data: { category: Category[] };
    };
    const { category: categoryResponse } = result.data;

    return new Response(JSON.stringify(categoryResponse), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("Something went wrong", { status: 500 });
  }
};
