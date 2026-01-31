import { auth } from "./auth";
import { headers } from "next/headers";
import { SignJWT } from "jose";

/**
 * Get the current session from Better-Auth on the server
 * This is a helper function for use in server actions and API routes
 */
export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.session || !session?.user) {
      return null;
    }

    // Create JWT access token for Hasura compatibility
    const jwtPayload = {
      sub: session.user.id,
      iat: Math.floor(Date.now() / 1000),
      "https://hasura.io/jwt/claims": {
        "x-hasura-allowed-roles": ["user"],
        "x-hasura-default-role": "user",
        "x-hasura-role": "user",
        "x-hasura-user-id": session.user.id,
      },
    };

    const accessToken = await new SignJWT(jwtPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    return {
      user: session.user,
      session: session.session,
      accessToken,
      userId: session.user.id,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Require authentication - throws if not authenticated
 * Use in server actions and API routes that require authentication
 */
export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    throw new Error("Unauthorized - Please sign in");
  }
  
  return session;
}
