// Authentication utilities
import { auth } from "@/auth";

export interface AuthSession {
  accessToken: string;
  userId: string;
}

export async function authenticateUser(): Promise<AuthSession> {
  const session: any = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return {
    accessToken: session.accessToken,
    userId: session.userId,
  };
}
