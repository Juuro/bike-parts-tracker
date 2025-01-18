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

    const userId = session.userId;
    const accessToken = session.accessToken;

    const query = `
      query GetParts {
        part(
          where: { user_id: { _eq: "${userId}" } }
          order_by: { updated_at: desc_nulls_last }
        ) {
          secondhand
          buy_price
          sell_price
          model_year
          weight
          name
          receipt
          shop_url
          created_at
          purchase_date
          updated_at
          id
          manufacturer_id
          part_status_slug
          type_id
          user_id
          manufacturer {
            name
          }
          part_status {
            name
            slug
            available
          }
          parts_type {
            name
          }
          installations(limit: 1, order_by: { installed_at: desc_nulls_last }) {
            id
            bike {
              name
              id
            }
            installed_at
            uninstalled_at
            part {
              id
            }
          }
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
      data: { part: Part[] };
    };
    const { part: partResponse } = result.data;

    return new Response(JSON.stringify(partResponse), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("Something went wrong", { status: 500 });
  }
};
