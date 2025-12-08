import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { twoFactor } from "better-auth/plugins/two-factor";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Create PostgreSQL connection pool
// Note: Hasura uses PostgreSQL underneath. You'll need to set DATABASE_URL
// to the PostgreSQL connection string (not the Hasura GraphQL endpoint)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

const db = drizzle(pool);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: false, // Set to true if your tables use plural names (users vs user)
  }),
  
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      // TODO: Implement email sending
      console.log(`Password reset URL for ${user.email}:`, url);
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID),
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache for 5 minutes
    },
  },

  plugins: [
    twoFactor({
      issuer: "BikePartsTracker",
    }),
  ],

  advanced: {
    generateId: () => {
      // Generate UUID for compatibility with Hasura
      return crypto.randomUUID();
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  trustedOrigins: process.env.NEXTAUTH_URL
    ? [process.env.NEXTAUTH_URL]
    : ["http://localhost:3000"],
});

// Export types for use in the application
export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
