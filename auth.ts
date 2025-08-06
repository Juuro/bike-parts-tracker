import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { makeRateLimitedRequest } from "@/lib/rateLimiter";
import type { Provider } from "next-auth/providers";
import { HasuraAdapter } from "@auth/hasura-adapter";
import { SignJWT } from "jose";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import bcrypt from "bcryptjs";

// Extended interfaces for better type safety
interface ExtendedToken extends JWT {
  stravaAccessToken?: string;
  stravaRefreshToken?: string;
  stravaExpiresAt?: number;
  accessToken?: string;
  invalidateUserCache?: boolean;
  "https://hasura.io/jwt/claims"?: {
    "x-hasura-allowed-roles": string[];
    "x-hasura-default-role": string;
    "x-hasura-role": string;
    "x-hasura-user-id": string;
  };
}

interface ExtendedSession extends Session {
  accessToken?: string;
  userId: string;
  dataFresh?: boolean;
  dataError?: string;
  userDataUpdatedAt?: number;
}

// Database user type for GraphQL responses
interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  image: string;
  emailVerified: Date | null;
}

// GraphQL queries
const GET_USER_QUERY = `
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

const GET_USER_BY_EMAIL_QUERY = `
  query GetUserByEmail($email: String!) {
    users(where: {email: {_eq: $email}}) {
      id
      name
      email
      password
      image
      emailVerified
    }
  }
`;

const CREATE_USER_MUTATION = `
  mutation CreateUser($email: String!, $name: String!, $password: String!) {
    insert_users_one(object: {email: $email, name: $name, password: $password}) {
      id
      name
      email
      image
      emailVerified
    }
  }
`;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" }, // For registration
        mode: { label: "Mode", type: "hidden" }, // signin or signup
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const name = credentials.name as string;
        const mode = credentials.mode as string;

        try {
          if (mode === "signup") {
            // Registration flow
            if (!name) {
              throw new Error("Name is required for registration");
            }

            // Check if user already exists
            const existingUserResponse = await fetch(
              process.env.HASURA_PROJECT_ENDPOINT!,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET!,
                },
                body: JSON.stringify({
                  query: GET_USER_BY_EMAIL_QUERY,
                  variables: { email },
                }),
              }
            );

            const existingUserResult = await existingUserResponse.json();
            if (existingUserResult.data?.users?.length > 0) {
              throw new Error("User already exists with this email");
            }

            // Hash password
            const saltRounds = parseInt(
              process.env.BCRYPT_SALT_ROUNDS || "12",
              10
            );
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create new user
            const createUserResponse = await fetch(
              process.env.HASURA_PROJECT_ENDPOINT!,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET!,
                },
                body: JSON.stringify({
                  query: CREATE_USER_MUTATION,
                  variables: { email, name, password: hashedPassword },
                }),
              }
            );

            const createUserResult = await createUserResponse.json();
            if (createUserResult.errors) {
              throw new Error("Failed to create user");
            }

            const newUser = createUserResult.data?.insert_users_one;
            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              image: newUser.image,
            };
          } else {
            // Login flow
            const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET!,
              },
              body: JSON.stringify({
                query: GET_USER_BY_EMAIL_QUERY,
                variables: { email },
              }),
            });

            const result = await response.json();
            const user = result.data?.users?.[0];

            if (!user) {
              throw new Error("No user found with this email");
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(
              password,
              user.password
            );
            if (!isValidPassword) {
              throw new Error("Invalid password");
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            };
          }
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  adapter: HasuraAdapter({
    endpoint: process.env.HASURA_PROJECT_ENDPOINT!,
    adminSecret: process.env.HASURA_ADMIN_SECRET!,
  }),
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error", // Re-enable custom error page
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Allow sign in for all verified accounts
      return true;
    },
    async jwt({ token, account, profile }): Promise<ExtendedToken> {
      const extendedToken = token as ExtendedToken;

      // Store Strava access token if connecting via Strava
      if (account?.provider === "strava" && account?.access_token) {
        extendedToken.stravaAccessToken = account.access_token;
        extendedToken.stravaRefreshToken = account.refresh_token;
        extendedToken.stravaExpiresAt = account.expires_at;
      }

      // Create JWT payload with only necessary claims (don't include accessToken to avoid circular reference)
      const jwtPayload = {
        sub: extendedToken.sub,
        iat: Math.floor(Date.now() / 1000),
        "https://hasura.io/jwt/claims": {
          "x-hasura-allowed-roles": ["user"],
          "x-hasura-default-role": "user",
          "x-hasura-role": "user",
          "x-hasura-user-id": extendedToken.sub,
        },
      };

      const encodedToken = await new SignJWT(jwtPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .sign(new TextEncoder().encode(process.env.JWT_SECRET));

      if (encodedToken) {
        extendedToken.accessToken = encodedToken;
      }

      return {
        ...extendedToken,
        "https://hasura.io/jwt/claims": {
          "x-hasura-allowed-roles": ["user"],
          "x-hasura-default-role": "user",
          "x-hasura-role": "user",
          "x-hasura-user-id": extendedToken.sub!,
        },
      };
    },
    // Add user ID to the session and fetch latest user data only when needed
    session: async ({ session, token, user }): Promise<ExtendedSession> => {
      const extendedSession = session as ExtendedSession;
      const extendedToken = token as ExtendedToken;

      extendedSession.accessToken = extendedToken.accessToken; // Pass accessToken to the session
      extendedSession.userId = extendedToken.sub ?? "";

      // MUCH MORE AGGRESSIVE CACHING - Only fetch user data in very specific cases
      const shouldFetchUserData = (): boolean => {
        // Never fetch if we already have user ID - this is the key fix
        if (extendedSession.user?.id) {
          return false;
        }

        // Only fetch on absolute first session creation when no user data exists at all
        if (
          !extendedSession.user ||
          !extendedSession.user.name ||
          !extendedSession.user.email
        ) {
          return true;
        }

        // Check if there's a cache invalidation flag in the token
        if (extendedToken.invalidateUserCache) {
          return true;
        }

        // Don't fetch if marked as stale - let it stay stale rather than hit rate limits
        return false;
      };

      // Only fetch user data when absolutely necessary
      if (extendedToken.sub && shouldFetchUserData()) {
        try {
          const result = await makeRateLimitedRequest(async () => {
            const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET!,
              },
              body: JSON.stringify({
                query: GET_USER_QUERY,
                variables: { userId: extendedToken.sub },
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
          }, 2); // 2 total attempts (1 retry) to avoid amplification

          const dbUser: DatabaseUser | null = result.data?.users_by_pk;

          if (dbUser) {
            // Update session with latest data from database
            extendedSession.user = {
              ...extendedSession.user,
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              image: dbUser.image,
            };
            // Mark session as fresh with timestamp
            extendedSession.dataFresh = true;
            extendedSession.userDataUpdatedAt = Date.now();
            // Clear any cache invalidation flag
            delete extendedToken.invalidateUserCache;
          } else {
            console.warn(`User ${extendedToken.sub} not found in database`);
            extendedSession.dataFresh = false;
            extendedSession.dataError = "User not found in database";
          }
        } catch (error) {
          console.error("Error fetching user data in session callback:", error);
          // Mark session as potentially stale after error but don't fail
          extendedSession.dataFresh = false;
          extendedSession.dataError =
            error instanceof Error ? error.message : "Unknown error";
        }
      } else {
        // Preserve existing cache state when not fetching
        extendedSession.dataFresh = extendedSession.dataFresh ?? true;
        extendedSession.userDataUpdatedAt =
          extendedSession.userDataUpdatedAt ?? Date.now();
      }

      return extendedSession;
    },
  },
});
