import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Debug: MFA status endpoint called");

    const session = await auth();
    console.log("Debug: Session:", JSON.stringify(session, null, 2));

    if (!session?.user?.id) {
      console.log("Debug: No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For debugging, let's just return a simple response first
    return NextResponse.json({
      debug: true,
      userId: session.user.id,
      sessionKeys: Object.keys(session),
      userKeys: Object.keys(session.user),
    });
  } catch (error) {
    console.error("Debug: Error in MFA status:", error);
    return NextResponse.json(
      { error: "Server error", details: error },
      { status: 500 }
    );
  }
}
