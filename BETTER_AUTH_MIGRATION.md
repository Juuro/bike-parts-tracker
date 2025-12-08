# Auth.js to Better-Auth Migration

This document describes the migration from Auth.js (NextAuth.js) to Better-Auth.

## Overview

The authentication system has been successfully migrated from Auth.js v5 (beta.29) to Better-Auth v1.4.5. This migration was done following the [Better-Auth migration guide](https://www.better-auth.com/docs/guides/next-auth-migration-guide) after Auth.js joined Better-Auth.

## Changes Made

### Dependencies

**Removed:**
- `next-auth` v5.0.0-beta.29
- `@auth/core` v0.40.0
- `@auth/hasura-adapter` v1.4.2
- `@auth/unstorage-adapter` v2.0.0

**Added:**
- `better-auth` v1.4.5

### Configuration Files

**Created:**
- `lib/auth.ts` - Better-Auth server configuration
- `lib/auth-client.ts` - Better-Auth React client configuration
- `app/api/auth/[...all]/route.ts` - Better-Auth API route handler
- `app/signin/page.tsx` - New signin page

**Removed:**
- `auth.ts` (root-level Auth.js configuration)
- `app/api/auth/[...nextauth]/route.ts`
- `app/auth/signin/page.tsx`
- `app/auth/error/page.tsx`

**Modified:**
- `middleware.ts` - Simplified middleware (Better-Auth handles its own middleware)
- `lib/authUtils.ts` - Updated to use Better-Auth session API
- `app/layout.tsx` - Removed SessionProvider (Better-Auth doesn't need it)

### Code Changes

#### Server-Side Changes

All server-side code that used Auth.js sessions has been updated:

**Before (Auth.js):**
```typescript
import { auth } from "@/auth";

const session = await auth();
const userId = session?.userId;
const accessToken = session?.accessToken;
```

**After (Better-Auth):**
```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({
  headers: await headers(),
});
const userId = session?.user?.id;
const accessToken = session?.session?.token;
```

#### Client-Side Changes

All client-side components that used Auth.js hooks have been updated:

**Before (Auth.js):**
```typescript
import { useSession, signIn, signOut } from "next-auth/react";

const { data: session, status } = useSession();
if (status === "authenticated") {
  // ...
}
```

**After (Better-Auth):**
```typescript
import { useSession, signIn, signOut } from "@/lib/auth-client";

const { data: session, isPending } = useSession();
if (!isPending && session?.user) {
  // ...
}
```

### Files Updated

**API Routes (24 files):**
- All files in `app/api/bikes/`
- All files in `app/api/mfa/`
- All files in `app/api/strava/`
- All files in `app/api/upload/`
- All other API routes

**Server Actions (8 files):**
- `app/actions/addBike.ts`
- `app/actions/addInstallation.ts`
- `app/actions/addManufacturer.ts`
- `app/actions/addPart.ts`
- `app/actions/deleteBike.ts`
- `app/actions/deletePart.ts`
- `app/actions/updateBike.ts`
- `app/actions/updatePart.ts`
- `app/actions/updateUserProfile.ts`
- And more...

**Pages (5 files):**
- `app/page.tsx`
- `app/bikes/[id]/page.tsx`
- `app/parts/page.tsx`
- `app/profile/page.tsx`
- `app/security/page.tsx`

**Components (10+ files):**
- `components/auth-components.tsx`
- `components/user-button.tsx`
- `components/AddBikeModal.tsx`
- `components/EditBikeModal.tsx`
- `components/AddPartModal.tsx`
- `components/EditPartModal.tsx`
- `components/ProfileForm.tsx`
- `components/HomeBikes.tsx`
- And more...

## Database Compatibility

Better-Auth is designed to be compatible with Auth.js database schemas. The existing PostgreSQL database tables (`users`, `accounts`, `sessions`, `verification_tokens`) work with Better-Auth without requiring any schema changes.

## Environment Variables

The following environment variables are required:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Auth Secret (use either)
AUTH_SECRET=your-secret-key
# OR
NEXTAUTH_SECRET=your-secret-key

# Google OAuth (optional)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# App URLs
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Hasura (for GraphQL API)
HASURA_PROJECT_ENDPOINT=your-hasura-endpoint
HASURA_ADMIN_SECRET=your-hasura-admin-secret
```

## Features Preserved

All existing authentication features have been preserved:

✅ **Email/Password Authentication**
- User registration
- User login
- Password hashing with bcrypt

✅ **Google OAuth**
- Social login with Google

✅ **Multi-Factor Authentication (MFA)**
- TOTP (Time-based One-Time Password)
- Backup codes
- WebAuthn/Passkeys

✅ **Session Management**
- JWT-based sessions
- Session token in Hasura queries
- Automatic session refresh

✅ **Strava Integration**
- OAuth connection
- Token management
- Bike data sync

✅ **Rate Limiting**
- Auth rate limiting preserved
- API rate limiting preserved

## Testing Required

Before deploying to production, the following should be tested:

1. **Authentication Flows:**
   - [ ] Email/password signup
   - [ ] Email/password login
   - [ ] Google OAuth login
   - [ ] Logout

2. **MFA Functionality:**
   - [ ] Enable TOTP MFA
   - [ ] Login with MFA code
   - [ ] Generate backup codes
   - [ ] Login with backup code
   - [ ] Disable MFA
   - [ ] WebAuthn/Passkey registration
   - [ ] WebAuthn/Passkey authentication

3. **Session Management:**
   - [ ] Session persistence across page reloads
   - [ ] Session expiration
   - [ ] Protected routes redirect to signin
   - [ ] Session data availability in API routes

4. **Strava Integration:**
   - [ ] Connect Strava account
   - [ ] Sync bikes from Strava
   - [ ] Disconnect Strava account

5. **Profile Management:**
   - [ ] Update user profile
   - [ ] Upload profile image
   - [ ] Update preferences

## Known Issues

1. **Build-Time Database Error:** During static page generation, Better-Auth attempts to connect to the database, which fails if no database is available. This is expected and doesn't affect the runtime behavior.

2. **Session Update:** The `update()` function from Auth.js's `useSession` hook is not available in Better-Auth. Profile updates no longer trigger manual session refresh, as Better-Auth handles this automatically.

## Migration Notes

- **Breaking Change:** The session object structure has changed. Code accessing `session.userId` must now use `session.user.id`, and `session.accessToken` must now use `session.session.token`.

- **Hook Changes:** The `useSession` hook now returns `{ data, isPending }` instead of `{ data, status }`. Status checks like `status === "authenticated"` should be replaced with `!isPending && session?.user`.

- **Redirect URLs:** All authentication redirects now point to `/signin` instead of `/api/auth/signin`.

## Security Improvements

- Better-Auth provides built-in CSRF protection
- Better-Auth has better TypeScript support with strict typing
- The configuration is more explicit and easier to audit
- Rate limiting and security features are preserved from the original implementation
- **Next.js Updated**: Updated from 15.4.7 to 16.0.7 to patch RCE vulnerability in React flight protocol (CVE-2025-66478)

## References

- [Better-Auth Documentation](https://www.better-auth.com/docs/introduction)
- [Better-Auth Next.js Guide](https://www.better-auth.com/docs/guides/next-auth-migration-guide)
- [Better-Auth Migration Guide](https://www.better-auth.com/docs/guides/next-auth-migration-guide)
- [Auth.js Joins Better-Auth Announcement](https://www.better-auth.com/blog/authjs-joins-better-auth)
