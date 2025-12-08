import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

// Import Kysely adapter directly - not exported in package.json
// @ts-ignore - kyselyAdapter exists but not in public exports
import { kyselyAdapter } from "better-auth/dist/adapters/kysely-adapter";
// @ts-ignore - twoFactor exists but checking path
import { twoFactor } from "better-auth/plugins/two-factor";

// Create PostgreSQL connection pool
// Note: Hasura uses PostgreSQL underneath. You'll need to set DATABASE_URL
// to the PostgreSQL connection string (not the Hasura GraphQL endpoint)
const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  }),
});

const db = new Kysely({
  dialect,
});

export const auth = betterAuth({
  database: kyselyAdapter(db, {
    type: "postgres",
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
      backupCodeLength: 8,
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
