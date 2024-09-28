import fetch from "node-fetch";
import { auth } from "@/auth";

export const GET = async () => {
  try {
    const session = await auth();

    const accessToken = session?.accessToken;

    const query = `
      query {
        part_status {
          slug
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
      data: { part_status: PartStatus[] };
    };
    const { part_status: userResponse } = result.data;

    return new Response(JSON.stringify(userResponse), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("Something went wrong", { status: 500 });
  }
};
