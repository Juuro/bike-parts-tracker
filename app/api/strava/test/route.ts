import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (request: NextRequest) => {
  // Simple test to verify Strava credentials
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  return new Response(
    JSON.stringify({
      clientIdConfigured: !!clientId,
      clientSecretConfigured: !!clientSecret,
      clientId: clientId || "MISSING",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
