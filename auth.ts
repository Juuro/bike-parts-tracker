import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { makeRateLimitedRequest } from "@/lib/rateLimiter";
import type { Provider } from "next-auth/providers";
import { HasuraAdapter } from "@auth/hasura-adapter";
import { SignJWT } from "jose";

// Custom Strava provider since it's not built-in
const Strava: Provider = {
  id: "strava",
  name: "Strava",
  type: "oauth",
  authorization: {
    url: "https://www.strava.com/oauth/authorize",
    params: {
      scope: "read,activity:read_all,profile:read_all",
      response_type: "code",
    },
  },
  token: "https://www.strava.com/oauth/token",
  userinfo: "https://www.strava.com/api/v3/athlete",
  clientId: process.env.STRAVA_CLIENT_ID,
  clientSecret: process.env.STRAVA_CLIENT_SECRET,
  profile(profile) {
    return {
      id: profile.id.toString(),
      name: `${profile.firstname} ${profile.lastname}`,
      email: profile.email || "",
      image: profile.profile || profile.profile_medium,
      stravaId: profile.id,
      stravaUsername: profile.username,
    };
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, Strava],
  adapter: HasuraAdapter({
    endpoint: process.env.HASURA_PROJECT_ENDPOINT!,
    adminSecret: process.env.HASURA_ADMIN_SECRET!,
  }),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Store Strava access token if connecting via Strava
      if (account?.provider === "strava" && account?.access_token) {
        token.stravaAccessToken = account.access_token;
        token.stravaRefreshToken = account.refresh_token;
        token.stravaExpiresAt = account.expires_at;
      }

      // Create JWT payload with only necessary claims (don't include accessToken to avoid circular reference)
      const jwtPayload = {
        sub: token.sub,
        iat: Math.floor(Date.now() / 1000),
        "https://hasura.io/jwt/claims": {
          "x-hasura-allowed-roles": ["user"],
          "x-hasura-default-role": "user",
          "x-hasura-role": "user",
          "x-hasura-user-id": token.sub,
        },
      };

      const encodedToken = await new SignJWT(jwtPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .sign(new TextEncoder().encode(process.env.JWT_SECRET));

      if (encodedToken) {
        token.accessToken = encodedToken;
      }

      return {
        ...token,
        "https://hasura.io/jwt/claims": {
          "x-hasura-allowed-roles": ["user"],
          "x-hasura-default-role": "user",
          "x-hasura-role": "user",
          "x-hasura-user-id": token.sub,
        },
      };
    },
    // Add user ID to the session and fetch latest user data only when needed
    session: async ({ session, token, user }) => {
      (session as any).accessToken = token.accessToken; // Pass accessToken to the session
      session.userId = token.sub ?? "";

      // MUCH MORE AGGRESSIVE CACHING - Only fetch user data in very specific cases
      const shouldFetchUserData = () => {
        // Never fetch if we already have user ID - this is the key fix
        if (session.user?.id) {
          return false;
        }

        // Only fetch on absolute first session creation when no user data exists at all
        if (!session.user || !session.user.name || !session.user.email) {
          return true;
        }

        // Check if there's a cache invalidation flag in the token
        if (token.invalidateUserCache) {
          return true;
        }

        // Don't fetch if marked as stale - let it stay stale rather than hit rate limits
        return false;
      };

      // Only fetch user data when absolutely necessary
      if (token.sub && shouldFetchUserData()) {
        try {
          const result = await makeRateLimitedRequest(async () => {
            const query = `
              query GetUser($userId: uuid!) {
                users_by_pk(id: $userId) {
                  id
                  name
                  email
                  image
                  emailVerified
                }
              }
            `;

            const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET!,
              },
              body: JSON.stringify({
                query,
                variables: { userId: token.sub },
              }),
            });

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            const result = await response.json();

            if (result.errors) {
              throw new Error(
                `GraphQL errors: ${JSON.stringify(result.errors)}`
              );
            }

            return result;
          }, 1); // Only 1 retry to avoid amplification

          const dbUser = result.data?.users_by_pk;

          if (dbUser) {
            // Update session with latest data from database
            session.user = {
              ...session.user,
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              image: dbUser.image,
              emailVerified: dbUser.emailVerified,
            };
            // Mark session as fresh with timestamp
            (session as any).dataFresh = true;
            (session as any).userDataUpdatedAt = Date.now();
            // Clear any cache invalidation flag
            delete (token as any).invalidateUserCache;
          } else {
            console.warn(`User ${token.sub} not found in database`);
            (session as any).dataFresh = false;
            (session as any).dataError = "User not found in database";
          }
        } catch (error) {
          console.error("Error fetching user data in session callback:", error);
          // Mark session as potentially stale after error but don't fail
          (session as any).dataFresh = false;
          (session as any).dataError =
            error instanceof Error ? error.message : "Unknown error";
        }
      } else {
        // Preserve existing cache state when not fetching
        (session as any).dataFresh = (session as any).dataFresh ?? true;
        (session as any).userDataUpdatedAt =
          (session as any).userDataUpdatedAt ?? Date.now();
      }

      return session;
    },
  },
});
