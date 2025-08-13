// API route to enable MFA
import { auth } from "@/auth";
import {
  generateMFASecret,
  generateBackupCodes,
  verifyMFACode,
} from "@/lib/mfaUtils";
import { makeRateLimitedRequest } from "@/lib/rateLimiter";

export const dynamic = "force-dynamic";

export const POST = async (request: Request) => {
  try {
    const session: any = await auth();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { verificationCode } = await request.json();

    if (!verificationCode) {
      return new Response("Verification code required", { status: 400 });
    }

    const userId = session.userId;
    const accessToken = session.accessToken;

    // Get user's current MFA secret (should be in pending state)
    const getUserQuery = `
      query GetUser($userId: uuid!) {
        users_by_pk(id: $userId) {
          id
          email
          mfa_enabled
          mfa_secret
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

    if (!user.mfa_secret) {
      return new Response("MFA setup not initiated", { status: 400 });
    }

    // Verify the TOTP code
    const isValidCode = verifyMFACode(verificationCode, user.mfa_secret);
    if (!isValidCode) {
      return new Response("Invalid verification code", { status: 400 });
    }

    // Generate backup codes
    const backupCodes = await generateBackupCodes();

    // Enable MFA and store backup codes
    const enableMFAMutation = `
      mutation EnableMFA($userId: uuid!, $backupCodes: [user_backup_codes_insert_input!]!) {
        update_users_by_pk(
          pk_columns: { id: $userId }
          _set: { 
            mfa_enabled: true,
            backup_codes_generated_at: "now()"
          }
        ) {
          id
          mfa_enabled
        }
        
        insert_user_backup_codes(objects: $backupCodes) {
          returning {
            id
          }
        }
      }
    `;

    const backupCodeObjects = backupCodes.map(({ hash }) => ({
      user_id: userId,
      code_hash: hash,
    }));

    await makeRateLimitedRequest(async () => {
      const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          query: enableMFAMutation,
          variables: {
            userId,
            backupCodes: backupCodeObjects,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    }, 2);

    // Return backup codes to user (only time they'll see them)
    return new Response(
      JSON.stringify({
        success: true,
        backupCodes: backupCodes.map((bc) => bc.code),
        message:
          "MFA enabled successfully. Please save these backup codes in a secure location.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error enabling MFA:", error);
    return new Response("Internal server error", { status: 500 });
  }
};
