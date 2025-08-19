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
      query {
        part_status {
          slug
          name
          available
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

    if (!result.data || !result.data.part_status) {
      console.error("🔧 Part Status API - No data returned:", result);
      return new Response(JSON.stringify([]), { status: 200 });
    }

    const { part_status: partStatusResponse } = result.data;

    return new Response(JSON.stringify(partStatusResponse), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("Something went wrong", { status: 500 });
  }
};
