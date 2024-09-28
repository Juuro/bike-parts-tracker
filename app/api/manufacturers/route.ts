import { auth } from "@/auth";

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
        manufacturer {
          id
          name
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

    const result = (await response.json()) as {
      data: { manufacturer: Manufacturer[] };
    };
    const { manufacturer: manufacturerResponse } = result.data;

    return new Response(JSON.stringify(manufacturerResponse), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("Something went wrong", { status: 500 });
  }
};
