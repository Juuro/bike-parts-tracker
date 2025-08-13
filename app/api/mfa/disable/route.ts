// API route to disable MFA
import { auth } from "@/auth";
import { verifyMFACode, verifyBackupCode } from "@/lib/mfaUtils";
import { makeRateLimitedRequest } from "@/lib/rateLimiter";

export const dynamic = "force-dynamic";

export const POST = async (request: Request) => {
  try {
    const session: any = await auth();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { verificationCode, backupCode } = await request.json();

    if (!verificationCode && !backupCode) {
      return new Response("Verification code or backup code required", {
        status: 400,
      });
    }

    const userId = session.userId || session.user?.id;
    const accessToken = session.accessToken;

    // Get user's current MFA status
    const getUserQuery = `
      query GetUser($userId: uuid!) {
        users_by_pk(id: $userId) {
          id
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

    if (!user.mfa_enabled) {
      return new Response("MFA not enabled", { status: 400 });
    }

    // Verify the provided code
    let isValidVerification = false;

    if (verificationCode && user.mfa_secret) {
      isValidVerification = verifyMFACode(verificationCode, user.mfa_secret);
    }

    if (!isValidVerification && backupCode) {
      // Check backup codes
      const backupCodeQuery = `
        query GetBackupCodes($userId: uuid!) {
          user_backup_codes(where: {
            user_id: {_eq: $userId}, 
            used_at: {_is_null: true}
          }) {
            id
            code_hash
          }
        }
      `;

      const backupResult = await makeRateLimitedRequest(async () => {
        const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            query: backupCodeQuery,
            variables: { userId },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      }, 2);

      const backupCodes = backupResult.data?.user_backup_codes || [];

      for (const storedCode of backupCodes) {
        const isValidBackup = await verifyBackupCode(
          backupCode,
          storedCode.code_hash
        );
        if (isValidBackup) {
          isValidVerification = true;
          break;
        }
      }
    }

    console.log("[MFA Disable] Verification result:", {
      isValidVerification,
      hasVerificationCode: !!verificationCode,
      hasBackupCode: !!backupCode,
      userHasMfaSecret: !!user.mfa_secret,
    });

    if (!isValidVerification) {
      console.error("[MFA Disable] Verification failed - code invalid");
      return new Response("Invalid verification code", { status: 400 });
    }

    // Step 1: Mark all backup codes as used (since delete permission isn't available)
    const disableBackupCodesMutation = `
      mutation DisableBackupCodes($userId: uuid!) {
        update_user_backup_codes(
          where: {user_id: {_eq: $userId}}, 
          _set: {used_at: "now()"}
        ) {
          affected_rows
        }
      }
    `;

    const disableResult = await makeRateLimitedRequest(async () => {
      const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          query: disableBackupCodesMutation,
          variables: { userId },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(
        "[MFA Disable] Backup codes disable result:",
        JSON.stringify(result, null, 2)
      );

      // Check for GraphQL errors
      if (result.errors && result.errors.length > 0) {
        console.error("[MFA Disable] GraphQL errors:", result.errors);
        throw new Error(`GraphQL Error: ${result.errors[0].message}`);
      }

      return result;
    }, 2);

    console.log(
      "[MFA Disable] Disabled backup codes:",
      disableResult.data?.update_user_backup_codes?.affected_rows || 0
    );

    // Step 2: Disable MFA in users table
    const disableMFAMutation = `
      mutation DisableMFA($userId: uuid!) {
        update_users_by_pk(
          pk_columns: { id: $userId }
          _set: { 
            mfa_enabled: false,
            mfa_secret: null,
            backup_codes_generated_at: null
          }
        ) {
          id
          mfa_enabled
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
          query: disableMFAMutation,
          variables: { userId },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(
        "[MFA Disable] Users table update result:",
        JSON.stringify(result, null, 2)
      );

      // Check for GraphQL errors
      if (result.errors && result.errors.length > 0) {
        console.error("[MFA Disable] GraphQL errors:", result.errors);
        throw new Error(`GraphQL Error: ${result.errors[0].message}`);
      }

      return result;
    }, 2);

    console.log("[MFA Disable] MFA disabled successfully for user:", userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "MFA disabled successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error disabling MFA:", error);
    return new Response("Internal server error", { status: 500 });
  }
};
