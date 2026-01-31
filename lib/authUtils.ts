// Authentication utilities
import { getSession } from "@/lib/auth-server";

export interface AuthSession {
  accessToken: string;
  userId: string;
}

export async function authenticateUser(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return {
    accessToken: session.accessToken,
    userId: session.userId,
  };
}
