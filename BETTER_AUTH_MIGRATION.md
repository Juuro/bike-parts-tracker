# Better-Auth Migration Guide

This document describes the migration from Auth.js (NextAuth.js) to Better-Auth.

## Overview

The authentication system has been migrated from Auth.js v5 to Better-Auth to take advantage of:
- Better TypeScript support
- More flexible authentication options
- Built-in two-factor authentication
- Improved session management
- Better plugin ecosystem

## Changes Made

### 1. Dependencies

**Removed:**
- `next-auth`
- `@auth/core`
- `@auth/hasura-adapter`
- `@auth/unstorage-adapter`

**Added:**
- `better-auth` - Core authentication library
- `kysely` - SQL query builder (for database adapter)
- `pg` - PostgreSQL driver

### 2. Configuration Files

**Created:**
- `lib/auth.ts` - Server-side Better-Auth configuration
- `lib/auth-client.ts` - Client-side Better-Auth hooks and functions
- `.env.example` - Environment variable template

**Modified:**
- `app/api/auth/[...nextauth]/route.ts` - Updated to use Better-Auth handler
- `middleware.ts` - Updated to use Better-Auth session checking
- `app/layout.tsx` - Removed SessionProvider (not needed with Better-Auth)
- `components/auth-components.tsx` - Updated sign-in/sign-out functions
- `components/user-button.tsx` - Updated to use Better-Auth useSession
- `app/auth/signin/page.tsx` - Rewritten to use Better-Auth client methods

**Archived (for reference):**
- `auth-old.ts` - Original Auth.js configuration
- `app/auth/signin/page-old.tsx` - Original sign-in page

### 3. Database Configuration

**IMPORTANT:** Better-Auth requires direct PostgreSQL database access, not just the Hasura GraphQL endpoint.

You need to configure the `DATABASE_URL` environment variable with your PostgreSQL connection string:

```
DATABASE_URL=postgresql://user:password@host:5432/database
```

#### Getting PostgreSQL Connection String from Hasura

If you're using Hasura Cloud:
1. Go to your Hasura project dashboard
2. Navigate to "Data" tab
3. Click on your database connection
4. Copy the connection string (it should start with `postgresql://`)

If you're self-hosting Hasura:
- Use the same PostgreSQL connection string that Hasura is configured with

### 4. Database Schema

Better-Auth requires specific database tables. Run the following migration to create them:

```sql
-- Better-Auth required tables
CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "emailVerified" BOOLEAN DEFAULT FALSE,
  "image" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "expiresAt" TIMESTAMP NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "expiresAt" TIMESTAMP,
  "password" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Two-factor authentication tables
CREATE TABLE IF NOT EXISTS "twoFactor" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "secret" TEXT NOT NULL,
  "backupCodes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Note:** If you have existing `users`, `sessions`, or `accounts` tables from Auth.js, you may need to migrate the data. The schema is similar but not identical.

## Environment Variables

Update your `.env` or `.env.local` file with the following variables (see `.env.example` for full template):

```env
# Required
DATABASE_URL=postgresql://...
HASURA_PROJECT_ENDPOINT=https://...
HASURA_ADMIN_SECRET=...
JWT_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional (for Google OAuth)
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
NEXT_PUBLIC_AUTH_GOOGLE_ID=...
```

## API Changes

### Server-side

**Before (Auth.js):**
```typescript
import { auth } from "@/auth";

const session = await auth();
```

**After (Better-Auth):**
```typescript
import { auth } from "@/lib/auth";

const session = await auth.api.getSession({
  headers: headers()
});
```

### Client-side

**Before (Auth.js):**
```typescript
import { useSession, signIn, signOut } from "next-auth/react";

const { data: session } = useSession();
await signIn("google");
await signOut();
```

**After (Better-Auth):**
```typescript
import { useSession, signIn, signOut } from "@/lib/auth-client";

const { data: session } = useSession();
await signIn.social({ provider: "google" });
await signOut();
```

## Features

### Supported Authentication Methods

1. **Email & Password** - Built-in credentials authentication
2. **Google OAuth** - Social login via Google
3. **Two-Factor Authentication (2FA)** - TOTP-based MFA with backup codes

### Session Management

- Sessions are stored in the database
- Cookie-based session caching (5-minute cache)
- Automatic session refresh
- 7-day session expiration

### Security Features

- Rate limiting (maintained from previous implementation)
- Secure password hashing (bcrypt)
- CSRF protection (built into Better-Auth)
- Secure cookies in production

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/auth/signin` to test authentication

3. Test the following flows:
   - Sign up with email/password
   - Sign in with email/password
   - Sign in with Google (if configured)
   - Sign out
   - Session persistence across page refreshes

## Troubleshooting

### "Cannot find module 'better-auth'"

Run: `npm install better-auth kysely pg --legacy-peer-deps`

### "Database connection failed"

- Verify `DATABASE_URL` is set correctly
- Ensure the PostgreSQL database is accessible
- Check that the database user has proper permissions

### "Session not persisting"

- Check that cookies are enabled in your browser
- Verify `NEXTAUTH_URL` matches your application URL
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly

### "Google OAuth not working"

- Verify `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set
- Ensure `NEXT_PUBLIC_AUTH_GOOGLE_ID` is set for client-side
- Check that the OAuth callback URL is configured in Google Console:
  `http://localhost:3000/api/auth/callback/google`

## Rollback

If you need to rollback to Auth.js:

1. Restore the old dependencies:
   ```bash
   npm install next-auth@^5.0.0-beta.29 @auth/core @auth/hasura-adapter
   npm uninstall better-auth kysely pg
   ```

2. Restore files:
   ```bash
   mv auth-old.ts auth.ts
   mv app/auth/signin/page-old.tsx app/auth/signin/page.tsx
   ```

3. Revert the changes in:
   - `middleware.ts`
   - `app/layout.tsx`
   - `components/auth-components.tsx`
   - `components/user-button.tsx`
   - Other components using `useSession`

## Resources

- [Better-Auth Documentation](https://better-auth.com/docs)
- [Better-Auth Migration Guide](https://better-auth.com/docs/guides/next-auth-migration-guide)
- [Kysely Documentation](https://kysely.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

For issues or questions about this migration:
1. Check the Better-Auth documentation
2. Review this migration guide
3. Check the `.env.example` for required environment variables
4. Ensure database schema is properly set up
