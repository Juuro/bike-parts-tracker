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
      query GetDisciplines {
        discipline(order_by: {name: asc}) {
          id
          abbr
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
      data?: { discipline: Discipline[] };
      errors?: any[];
    };

    if (result.errors) {
      console.error("GraphQL errors in disciplines:", result.errors);
      return new Response("GraphQL errors", { status: 500 });
    }

    if (!result.data || !result.data.discipline) {
      console.error("No discipline data returned:", result);
      return new Response("No data returned", { status: 500 });
    }

    const { discipline: disciplineResponse } = result.data;

    return new Response(JSON.stringify(disciplineResponse), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("Something went wrong", { status: 500 });
  }
};
