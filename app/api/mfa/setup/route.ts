// API route to setup MFA (get QR code)
import { auth } from "@/auth";
import { generateMFASecret } from "@/lib/mfaUtils";
import { makeRateLimitedRequest } from "@/lib/rateLimiter";

export const dynamic = "force-dynamic";

export const POST = async () => {
  try {
    const session: any = await auth();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.userId || session.user?.id;
    const accessToken = session.accessToken;

    // Get user's email for QR code generation
    const getUserQuery = `
      query GetUser($userId: uuid!) {
        users_by_pk(id: $userId) {
          id
          email
          mfa_enabled
        }
      }
    `;

    const userResult = await makeRateLimitedRequest(async () => {
      const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          query: getUserQuery,
          variables: { userId },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    }, 2);

    const user = userResult.data?.users_by_pk;
    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    if (user.mfa_enabled) {
      return new Response("MFA already enabled", { status: 400 });
    }

    // Generate MFA secret and QR code
    const { secret, qrCodeUrl } = generateMFASecret(user.email);

    // Store the secret temporarily (not enabled yet)
    const storeMFASecretMutation = `
      mutation StoreMFASecret($userId: uuid!, $secret: String!) {
        update_users_by_pk(
          pk_columns: { id: $userId }
          _set: { mfa_secret: $secret }
        ) {
          id
        }
      }
    `;

    await makeRateLimitedRequest(async () => {
      const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          query: storeMFASecretMutation,
          variables: {
            userId,
            secret,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    }, 2);

    return new Response(
      JSON.stringify({
        secret,
        qrCodeUrl,
        message:
          "Scan the QR code with your authenticator app and verify with a code to enable MFA",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error setting up MFA:", error);
    } else {
      console.error(
        "Error setting up MFA:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
    return new Response("Internal server error", { status: 500 });
  }
};
