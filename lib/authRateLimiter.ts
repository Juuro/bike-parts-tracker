// Authentication-specific rate limiter to prevent enumeration attacks
interface AuthAttempt {
  timestamp: number;
  success: boolean;
  type: "login" | "registration" | "email_check";
}

class AuthRateLimiter {
  private attempts = new Map<string, AuthAttempt[]>();
  private readonly windowMs: number;
  private readonly maxAttempts: number;
  private readonly maxEmailChecks: number;

  constructor(
    maxAttempts: number = 5, // Max 5 auth attempts per window
    maxEmailChecks: number = 3, // Max 3 email existence checks per window
    windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {
    this.maxAttempts = maxAttempts;
    this.maxEmailChecks = maxEmailChecks;
    this.windowMs = windowMs;
  }

  private getKey(identifier: string, type: "ip" | "email"): string {
    return `${type}:${identifier}`;
  }

  private cleanOldAttempts(key: string) {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    const filtered = attempts.filter(
      (attempt) => now - attempt.timestamp < this.windowMs
    );

    if (filtered.length === 0) {
      this.attempts.delete(key);
    } else {
      this.attempts.set(key, filtered);
    }
  }

  private getAttempts(
    key: string,
    type?: "login" | "registration" | "email_check"
  ): AuthAttempt[] {
    this.cleanOldAttempts(key);
    const attempts = this.attempts.get(key) || [];

    if (type) {
      return attempts.filter((attempt) => attempt.type === type);
    }

    return attempts;
  }

  canAttemptAuth(
    ip: string,
    email: string,
    type: "login" | "registration"
  ): { allowed: boolean; reason?: string; retryAfter?: number } {
    const ipKey = this.getKey(ip, "ip");
    const emailKey = this.getKey(email, "email");

    // Check IP-based rate limiting
    const ipAttempts = this.getAttempts(ipKey);
    if (ipAttempts.length >= this.maxAttempts) {
      const oldestAttempt = Math.min(...ipAttempts.map((a) => a.timestamp));
      const retryAfter = Math.ceil(
        (oldestAttempt + this.windowMs - Date.now()) / 1000
      );
      return {
        allowed: false,
        reason: "Too many authentication attempts from this IP",
        retryAfter,
      };
    }

    // Check email-based rate limiting (more restrictive for failed attempts)
    const emailAttempts = this.getAttempts(emailKey);
    const failedEmailAttempts = emailAttempts.filter((a) => !a.success);

    if (failedEmailAttempts.length >= Math.floor(this.maxAttempts * 0.6)) {
      // 60% of max attempts
      const oldestFailedAttempt = Math.min(
        ...failedEmailAttempts.map((a) => a.timestamp)
      );
      const retryAfter = Math.ceil(
        (oldestFailedAttempt + this.windowMs - Date.now()) / 1000
      );
      return {
        allowed: false,
        reason: "Too many failed attempts for this email",
        retryAfter,
      };
    }

    return { allowed: true };
  }

  canCheckEmail(
    ip: string,
    email: string
  ): { allowed: boolean; reason?: string; retryAfter?: number } {
    const ipKey = this.getKey(ip, "ip");
    const emailKey = this.getKey(email, "email");

    // Check IP-based email checking rate limiting
    const ipEmailChecks = this.getAttempts(ipKey, "email_check");
    if (ipEmailChecks.length >= this.maxEmailChecks) {
      const oldestCheck = Math.min(...ipEmailChecks.map((a) => a.timestamp));
      const retryAfter = Math.ceil(
        (oldestCheck + this.windowMs - Date.now()) / 1000
      );
      return {
        allowed: false,
        reason: "Too many email checks from this IP",
        retryAfter,
      };
    }

    // Check email-specific checking (prevent targeted enumeration)
    const emailChecks = this.getAttempts(emailKey, "email_check");
    if (emailChecks.length >= Math.floor(this.maxEmailChecks * 0.5)) {
      // 50% of max for specific email
      const oldestCheck = Math.min(...emailChecks.map((a) => a.timestamp));
      const retryAfter = Math.ceil(
        (oldestCheck + this.windowMs - Date.now()) / 1000
      );
      return {
        allowed: false,
        reason: "Too many checks for this email",
        retryAfter,
      };
    }

    return { allowed: true };
  }

  recordAttempt(
    ip: string,
    email: string,
    type: "login" | "registration" | "email_check",
    success: boolean
  ) {
    const ipKey = this.getKey(ip, "ip");
    const emailKey = this.getKey(email, "email");

    const attempt: AuthAttempt = {
      timestamp: Date.now(),
      success,
      type,
    };

    // Record for both IP and email
    const ipAttempts = this.attempts.get(ipKey) || [];
    ipAttempts.push(attempt);
    this.attempts.set(ipKey, ipAttempts);

    const emailAttempts = this.attempts.get(emailKey) || [];
    emailAttempts.push(attempt);
    this.attempts.set(emailKey, emailAttempts);
  }

  // Get time until rate limit resets
  getTimeUntilReset(ip: string, email: string): number {
    const ipKey = this.getKey(ip, "ip");
    const emailKey = this.getKey(email, "email");

    const ipAttempts = this.getAttempts(ipKey);
    const emailAttempts = this.getAttempts(emailKey);

    if (ipAttempts.length === 0 && emailAttempts.length === 0) {
      return 0;
    }

    const ipMin = ipAttempts.length > 0 ? Math.min(...ipAttempts.map(a => a.timestamp)) : Infinity;
    const emailMin = emailAttempts.length > 0 ? Math.min(...emailAttempts.map(a => a.timestamp)) : Infinity;
    const oldestAttempt = Math.min(ipMin, emailMin);
    return Math.max(0, this.windowMs - (Date.now() - oldestAttempt));
  }

  // Clean up old entries periodically to prevent memory leaks
  cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.attempts.forEach((attempts, key) => {
      const filtered = attempts.filter(
        (attempt: AuthAttempt) => now - attempt.timestamp < this.windowMs
      );

      if (filtered.length === 0) {
        keysToDelete.push(key);
      } else {
        this.attempts.set(key, filtered);
      }
    });

    keysToDelete.forEach((key) => this.attempts.delete(key));
  }
}

// Global auth rate limiter instance with serverless-friendly cleanup
class ServerlessAuthRateLimiter extends AuthRateLimiter {
  private lastCleanup = Date.now();
  private readonly cleanupInterval = 5 * 60 * 1000; // 5 minutes

  // Override methods to include automatic cleanup
  canAttemptAuth(
    ip: string,
    email: string,
    type: "login" | "registration"
  ): { allowed: boolean; reason?: string; retryAfter?: number } {
    this.cleanupIfNeeded();
    return super.canAttemptAuth(ip, email, type);
  }

  canCheckEmail(
    ip: string,
    email: string
  ): { allowed: boolean; reason?: string; retryAfter?: number } {
    this.cleanupIfNeeded();
    return super.canCheckEmail(ip, email);
  }

  recordAttempt(
    ip: string,
    email: string,
    type: "login" | "registration" | "email_check",
    success: boolean
  ) {
    this.cleanupIfNeeded();
    super.recordAttempt(ip, email, type, success);
  }

  // Cleanup on demand when needed, instead of using setInterval
  private cleanupIfNeeded() {
    const now = Date.now();
    if (now - this.lastCleanup > this.cleanupInterval) {
      this.cleanup();
      this.lastCleanup = now;
    }
  }

  // Force cleanup (useful for testing or manual cleanup)
  forceCleanup() {
    this.cleanup();
    this.lastCleanup = Date.now();
  }
}

export const authRateLimiter = new ServerlessAuthRateLimiter();

// Helper function to get client IP (with fallbacks for various deployment scenarios)
export function getClientIP(request?: Request): string {
  if (!request) {
    return "unknown";
  }

  // Try various headers that might contain the real IP
  const headers = request.headers;
  const candidates = [
    headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    headers.get("x-real-ip"),
    headers.get("x-client-ip"),
    headers.get("cf-connecting-ip"), // Cloudflare
    headers.get("x-vercel-forwarded-for"), // Vercel
  ].filter(Boolean);

  return candidates[0] || "unknown";
}
