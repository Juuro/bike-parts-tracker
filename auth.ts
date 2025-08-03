import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
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
  debug: true,
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
      token.accessToken = "";

      // Store Strava access token if connecting via Strava
      if (account?.provider === "strava" && account?.access_token) {
        token.stravaAccessToken = account.access_token;
        token.stravaRefreshToken = account.refresh_token;
        token.stravaExpiresAt = account.expires_at;
      }

      const encodedToken = await new SignJWT(token)
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

      // Check if we need to fetch fresh user data
      const shouldFetchUserData = () => {
        // Always fetch on first session creation (no existing session data)
        if (!session.user?.id) return true;
        
        // Check if there's a cache invalidation flag in the token
        if (token.invalidateUserCache) return true;
        
        // Check if session data is marked as stale
        if ((session as any).dataFresh === false) return true;
        
        // Check if user data is older than 1 hour (configurable)
        const lastUpdated = (session as any).userDataUpdatedAt;
        if (!lastUpdated) return true;
        
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        const isStale = Date.now() - lastUpdated > oneHour;
        return isStale;
      };

      // Only fetch user data when necessary
      if (token.sub && shouldFetchUserData()) {
        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount <= maxRetries) {
          try {
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

            if (response.ok) {
              const result = await response.json();

              if (result.errors) {
                throw new Error(
                  `GraphQL errors: ${JSON.stringify(result.errors)}`
                );
              }

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
                break; // Success, exit retry loop
              } else {
                console.warn(`User ${token.sub} not found in database`);
                (session as any).dataFresh = false;
                (session as any).dataError = "User not found in database";
                break; // No point retrying if user doesn't exist
              }
            } else {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }
          } catch (error) {
            retryCount++;
            const isLastRetry = retryCount > maxRetries;

            console.error(
              `Error fetching user data in session callback (attempt ${retryCount}/${
                maxRetries + 1
              }):`,
              error
            );

            if (isLastRetry) {
              // Mark session as potentially stale after all retries failed
              (session as any).dataFresh = false;
              (session as any).dataError =
                error instanceof Error ? error.message : "Unknown error";
              console.error(
                "All retries failed. Session may contain stale data."
              );
            } else {
              // Wait briefly before retry
              await new Promise((resolve) =>
                setTimeout(resolve, 100 * retryCount)
              );
            }
          }
        }
      } else {
        // Preserve existing cache state when not fetching
        (session as any).dataFresh = (session as any).dataFresh ?? true;
        (session as any).userDataUpdatedAt = (session as any).userDataUpdatedAt ?? Date.now();
      }

      return session;
    },
  },
});
