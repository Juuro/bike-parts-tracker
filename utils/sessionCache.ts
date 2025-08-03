// Session cache management utilities for NextAuth.js
// Use these functions to check cache state and log invalidation requests when profile data changes

import { auth } from "@/auth";

/**
 * Logs a session cache invalidation request for debugging purposes.
 *
 * NOTE: This function does not actually invalidate the session cache.
 * NextAuth.js doesn't provide a direct way to invalidate JWT token-based sessions
 * from server actions or API routes. The actual cache invalidation happens
 * through time-based expiration (1 hour) or when users manually refresh.
 *
 * For true cache invalidation, consider:
 * 1. Using database sessions instead of JWT tokens
 * 2. Implementing a Redis-based invalidation flag system
 * 3. Using NextAuth's database session strategy
 *
 * @deprecated Use refreshSessionData() after profile updates instead
 */
export async function logSessionCacheInvalidationRequest(): Promise<void> {
  try {
    console.log(
      "Session cache invalidation requested - will refresh on next session access"
    );

    // TODO: Implement actual cache invalidation mechanism
    // Current limitation: NextAuth JWT tokens cannot be invalidated from server-side
  } catch (error) {
    console.error("Failed to log session cache invalidation request:", error);
  }
}

/**
 * Placeholder for future cache invalidation implementation.
 *
 * This function outlines how proper session cache invalidation could be implemented
 * when using NextAuth.js with JWT tokens. Current implementation does not work
 * because JWT tokens cannot be modified from server actions.
 *
 * Recommended approaches for real cache invalidation:
 * 1. Switch to database sessions (session: { strategy: "database" })
 * 2. Use Redis to store invalidation flags that the session callback checks
 * 3. Implement a custom session provider with invalidation support
 *
 * @param userId - The user ID whose cache should be invalidated
 * @returns Promise that resolves when invalidation is complete
 */
export async function invalidateUserSessionCache(
  userId: string
): Promise<boolean> {
  // TODO: Implement one of the following approaches:

  // Option 1: Redis-based invalidation flags
  // await redis.set(`session_invalid:${userId}`, '1', 'EX', 300); // 5 min expiry

  // Option 2: Database session invalidation
  // await db.session.deleteMany({ where: { userId } });

  // Option 3: Custom invalidation service
  // await sessionInvalidationService.invalidate(userId);

  console.warn(
    "invalidateUserSessionCache not implemented - using time-based expiration only"
  );
  return false;
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
export function isSessionDataFresh(session: ExtendedSession): boolean {
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
