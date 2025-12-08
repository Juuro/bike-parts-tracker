import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

// Helper function to get secret safely
function getSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    // For build/development time, use a default secret
    // This allows the build to succeed even without the secret
    // The secret will be required at runtime in production
    console.warn("Using default secret for build. Set AUTH_SECRET in production!");
    return "development-secret-please-change-in-production";
  }
  return secret;
}

export const auth = betterAuth({
  database: {
    provider: "postgres",
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/bikepartstracker",
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
      enabled: !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    },
  },
  plugins: [nextCookies()],
  trustedOrigins: [
    process.env.NEXTAUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],
  secret: getSecret(),
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

export type Session = typeof auth.$Infer.Session;
