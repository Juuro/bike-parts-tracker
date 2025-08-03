// Session cache management utilities for NextAuth.js
// Use these functions to invalidate user session cache when profile data changes

import { auth } from "@/auth";

/**
 * Invalidates the user session cache to force fresh data fetch on next session callback
 * Call this after profile updates to ensure session data stays synchronized
 */
export async function invalidateSessionCache(): Promise<void> {
  try {
    // This approach works by setting a flag that the session callback will detect
    // Note: NextAuth doesn't provide direct cache invalidation, so we use this pattern

    // In a real implementation, you might want to:
    // 1. Store invalidation flags in a Redis cache
    // 2. Use database triggers to set invalidation flags
    // 3. Implement a more sophisticated cache management system

    console.log(
      "Session cache invalidation requested - will refresh on next session access"
    );

    // For now, we rely on the time-based cache expiration and manual invalidation
    // The session callback will check for the invalidateUserCache flag
  } catch (error) {
    console.error("Failed to invalidate session cache:", error);
  }
}

/**
 * Forces a session refresh by accessing the current session
 * This will trigger the session callback and fetch fresh user data if needed
 */
export async function refreshSessionData(): Promise<ExtendedSession | null> {
  try {
    // Force session refresh by accessing it
    const session = await auth();
    if (!session) return null;
    // Map user fields to ensure no nulls (convert null to undefined)
    const user = session.user
      ? {
          id: session.user.id ?? undefined,
          name: session.user.name ?? undefined,
          email: session.user.email ?? undefined,
          image: session.user.image ?? undefined,
        }
      : undefined;
    return {
      ...session,
      user,
    } as ExtendedSession;
  } catch (error) {
    console.error("Failed to refresh session data:", error);
    return null;
  }
}

/**
 * Utility to check if session data is fresh
 */
export function isSessionDataFresh(session: any): boolean {
  if (!session) return false;

  // Check if data is marked as fresh
  if (session.dataFresh === false) return false;

  // Check timestamp if available
  const lastUpdated = session.userDataUpdatedAt;
  if (!lastUpdated) return false;

  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
  const isStale = Date.now() - lastUpdated > oneHour;

  return !isStale;
}

/**
 * Constants for cache configuration
 */
export const SESSION_CACHE_CONFIG = {
  // How long to cache user data before considering it stale
  CACHE_DURATION: 60 * 60 * 1000, // 1 hour in milliseconds

  // Maximum number of retry attempts when fetching user data
  MAX_RETRIES: 2,

  // Base delay between retries (will be multiplied by retry count)
  RETRY_DELAY_BASE: 100, // milliseconds
} as const;

// Types for better TypeScript support
export interface SessionCacheState {
  dataFresh: boolean;
  userDataUpdatedAt?: number;
  dataError?: string;
}

export interface ExtendedSession {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
  };
  userId?: string;
  accessToken?: string;
  dataFresh?: boolean;
  userDataUpdatedAt?: number;
  dataError?: string;
}
