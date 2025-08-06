import { NextRequest, NextResponse } from "next/server";
import { authRateLimiter, getClientIP } from "@/lib/authRateLimiter";

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json();

    if (!email || !type) {
      return NextResponse.json(
        { error: "Email and type are required" },
        { status: 400 }
      );
    }

    if (!["login", "registration", "email_check"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const clientIP = getClientIP(request);

    let rateLimitCheck;
    if (type === "email_check") {
      rateLimitCheck = authRateLimiter.canCheckEmail(clientIP, email);
    } else {
      rateLimitCheck = authRateLimiter.canAttemptAuth(
        clientIP,
        email,
        type as "login" | "registration"
      );
    }

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          allowed: false,
          reason: rateLimitCheck.reason,
          retryAfter: rateLimitCheck.retryAfter,
        },
        { status: 429 }
      );
    }

    return NextResponse.json({ allowed: true });
  } catch (error) {
    console.error("Rate limit check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
