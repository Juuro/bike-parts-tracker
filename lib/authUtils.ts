// Authentication utilities
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface AuthSession {
  accessToken: string;
  userId: string;
}

export async function authenticateUser(): Promise<AuthSession> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return {
    accessToken: session.session.token,
    userId: session.user.id,
  };
}
