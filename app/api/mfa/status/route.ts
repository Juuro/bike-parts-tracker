import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session: any = await auth();
    let userId: string | undefined = session?.userId || session?.user?.id;

    // Fallback: derive userId from JWT if session.userId is not present
    if (!userId) {
      const token: any = await getToken({ req: request });
      if (token?.sub) userId = token.sub;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Query real status from Hasura
    const query = `
      query SecurityStatus($userId: uuid!) {
        users_by_pk(id: $userId) {
          mfa_enabled
          backup_codes_generated_at
          webauthn_enabled
        }
        authenticators(where: { user_id: { _eq: $userId } }, order_by: { created_at: desc }) {
          id
          credential_device_type
          created_at
          last_used_at
        }
        user_backup_codes_aggregate(where: { user_id: { _eq: $userId }, used_at: { _is_null: true } }) {
          aggregate { count }
        }
      }
    `;

    const res = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET!,
      },
      body: JSON.stringify({ query, variables: { userId } }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: 500 });
    }

    const json = await res.json();
    const u = json.data?.users_by_pk;
    const auths = json.data?.authenticators || [];
    const backupCount =
      json.data?.user_backup_codes_aggregate?.aggregate?.count || 0;

    return NextResponse.json({
      mfaEnabled: Boolean(u?.mfa_enabled),
      totpConfigured: Boolean(u?.mfa_enabled),
      webauthnEnabled: Boolean(u?.webauthn_enabled) || auths.length > 0,
      backupCodesCount: backupCount,
      backupCodesGeneratedAt: u?.backup_codes_generated_at || null,
      authenticators: auths.map((a: any) => ({
        id: a.id,
        deviceType: a.credential_device_type || "unknown",
        createdAt: a.created_at,
        lastUsedAt: a.last_used_at,
      })),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching MFA status:", error);
    } else {
      console.error(
        "Error fetching MFA status:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
