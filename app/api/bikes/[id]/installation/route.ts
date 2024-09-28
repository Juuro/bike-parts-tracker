import { auth } from "@/auth";

export const GET = async (req: Request, { params }: { params: any }) => {
  try {
    const session: any = await auth();
    if (!session) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const accessToken = session?.accessToken;
    const bikeId = params.id;

    const query = `
      query GetInstallation {
        installation(
          where: { bike_id: { _eq: "${bikeId}" } }
          order_by: { installed_at: desc_nulls_last }
        ) {
          id
          part {
            id
            buy_price
            model_year
            name
            purchase_date
            receipt
            secondhand
            sell_price
            shop_url
            updated_at
            user_id
            weight
            manufacturer {
              name
            }
            part_status {
              name
            }
            parts_type {
              name
            }
            installations {
              id
              uninstalled_at
              part {
                id
              }
              bike {
                id
                name
              }
            }
          }
          installed_at
          uninstalled_at
          bike {
            id
            name
          }
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
      data: { installation: PartStatus[] };
    };

    const { installation: installationResponse } = result.data;

    return new Response(JSON.stringify(installationResponse), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("Something went wrong", { status: 500 });
  }
};
