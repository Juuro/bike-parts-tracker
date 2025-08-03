// Global rate limiter to prevent exceeding Hasura Cloud limits
class RateLimiter {
  private requests: number[] = [];
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(maxRequests: number = 50, windowMs: number = 60000) {
    // Default: 50 requests per minute
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  private cleanOldRequests() {
    const now = Date.now();
    this.requests = this.requests.filter(
      (timestamp) => now - timestamp < this.windowMs
    );
  }

  canMakeRequest(): boolean {
    this.cleanOldRequests();
    return this.requests.length < this.maxRequests;
  }

  addRequest(): boolean {
    this.cleanOldRequests();

    if (this.requests.length >= this.maxRequests) {
      return false; // Rate limit exceeded
    }

    this.requests.push(Date.now());
    return true;
  }

  getTimeUntilReset(): number {
    this.cleanOldRequests();

    if (this.requests.length === 0) {
      return 0;
    }

    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
  }

  getRemainingRequests(): number {
    this.cleanOldRequests();
    return Math.max(0, this.maxRequests - this.requests.length);
  }
}

// Global instance - Conservative limit of 50 requests per minute to stay well under Hasura's 60
export const globalRateLimiter = new RateLimiter(50, 60000);

// Helper function to make rate-limited requests to Hasura
export async function makeRateLimitedRequest<T>(
  requestFn: () => Promise<T>,
  retries: number = 3,
  maxWaitTimeMs: number = 5000 // Maximum time to wait before giving up (prevents indefinite blocking)
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    if (!globalRateLimiter.canMakeRequest()) {
      const waitTime = globalRateLimiter.getTimeUntilReset();
      console.warn(`Rate limit reached. Waiting ${waitTime}ms before retry...`);

      if (attempt === retries) {
        throw new Error("Rate limit exceeded after all retries");
      }

      // Cap the wait time to prevent indefinite blocking in high-traffic scenarios
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(waitTime, maxWaitTimeMs))
      );
      continue;
    }

    try {
      globalRateLimiter.addRequest();
      const result = await requestFn();
      return result;
    } catch (error: any) {
      // Check if this is a rate limit error from Hasura
      const isRateLimit =
        error.message?.includes("limit") ||
        error.message?.includes("tenant-limit-exceeded") ||
        (error.errors &&
          error.errors.some(
            (e: any) => e.extensions?.code === "tenant-limit-exceeded"
          ));

      if (isRateLimit && attempt < retries) {
        console.warn(
          `Hasura rate limit detected, attempt ${attempt}/${retries}`
        );
        // Back off exponentially
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      throw error;
    }
  }

  throw new Error("All retries failed");
}
