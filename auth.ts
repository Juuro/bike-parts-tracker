import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

import { makeRateLimitedRequest } from "@/lib/rateLimiter";
import { authRateLimiter, getClientIP } from "@/lib/authRateLimiter";
import type { Provider } from "next-auth/providers";
import { HasuraAdapter } from "@auth/hasura-adapter";
import { SignJWT } from "jose";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import bcrypt from "bcryptjs";
import { authenticator } from "@otplib/preset-default";

// Extended interfaces for better type safety
interface ExtendedToken extends JWT {
  stravaAccessToken?: string;
  stravaRefreshToken?: string;
  stravaExpiresAt?: number;
  accessToken?: string;
  invalidateUserCache?: boolean;
  mfaRequired?: boolean;
  mfaVerified?: boolean;
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
      mfa_enabled
      mfa_secret

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

// Helper function to perform secure database queries with consistent timing
async function secureDbQuery(query: string, variables: any) {
  const startTime = Date.now();

  try {
    const response = await makeRateLimitedRequest(async () => {
      return fetch(process.env.HASURA_PROJECT_ENDPOINT!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET!,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });
    }, 2);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    // Add consistent timing delay to prevent timing attacks (minimum 100ms)
    const elapsed = Date.now() - startTime;
    const minDelay = 100;
    if (elapsed < minDelay) {
      await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
    }

    return result;
  } catch (error) {
    // Ensure consistent timing even on errors
    const elapsed = Date.now() - startTime;
    const minDelay = 100;
    if (elapsed < minDelay) {
      await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
    }
    throw error;
  }
}

// Helper function to safely check if user exists (prevents enumeration)
async function checkUserExists(
  email: string,
  clientIP: string
): Promise<{ exists: boolean; rateLimited: boolean; error?: string }> {
  // Check rate limiting first
  const rateLimitCheck = authRateLimiter.canCheckEmail(clientIP, email);
  if (!rateLimitCheck.allowed) {
    return {
      exists: false,
      rateLimited: true,
      error: `${rateLimitCheck.reason}. Try again in ${rateLimitCheck.retryAfter} seconds.`,
    };
  }

  try {
    const result = await secureDbQuery(GET_USER_BY_EMAIL_QUERY, { email });
    const userExists = result.data?.users?.length > 0;

    // Record the check attempt
    authRateLimiter.recordAttempt(clientIP, email, "email_check", true);

    return { exists: userExists, rateLimited: false };
  } catch (error) {
    // Record failed attempt
    authRateLimiter.recordAttempt(clientIP, email, "email_check", false);

    // Don't expose internal errors to prevent information leakage
    console.error("Error checking user existence:", error);
    return {
      exists: false,
      rateLimited: false,
      error: "Unable to verify email. Please try again later.",
    };
  }
}

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
        mfaCode: { label: "MFA Code", type: "text" }, // For MFA verification
        backupCode: { label: "Backup Code", type: "text" }, // For backup code recovery
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const name = credentials.name as string;
        const mode = credentials.mode as string;
        const mfaCode = credentials.mfaCode as string;
        const backupCode = credentials.backupCode as string;

        // Get client IP for rate limiting
        const clientIP = getClientIP(request) || "unknown";

        // Check rate limiting
        const rateLimitCheck = authRateLimiter.canAttemptAuth(
          clientIP,
          email,
          mode === "signup" ? "registration" : "login"
        );

        if (!rateLimitCheck.allowed) {
          throw new Error(
            `${rateLimitCheck.reason}. Try again in ${rateLimitCheck.retryAfter} seconds.`
          );
        }

        try {
          if (mode === "signup") {
            // Registration flow with enhanced security
            if (!name) {
              authRateLimiter.recordAttempt(
                clientIP,
                email,
                "registration",
                false
              );
              throw new Error("Name is required for registration");
            }

            // Check if user already exists (with rate limiting)
            const userCheck = await checkUserExists(email, clientIP);
            if (userCheck.rateLimited) {
              throw new Error(userCheck.error || "Rate limit exceeded");
            }

            if (userCheck.exists) {
              authRateLimiter.recordAttempt(
                clientIP,
                email,
                "registration",
                false
              );
              // Don't reveal that user exists - use generic message
              throw new Error(
                "Registration failed. Please try again or sign in if you already have an account."
              );
            }

            // Hash password with secure salt rounds
            const saltRounds = parseInt(
              process.env.BCRYPT_SALT_ROUNDS || "12",
              10
            );
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create new user
            const createUserResult = await secureDbQuery(CREATE_USER_MUTATION, {
              email,
              name,
              password: hashedPassword,
            });

            if (createUserResult.errors) {
              // Log the specific GraphQL errors for debugging
              console.error(
                "GraphQL user creation errors:",
                createUserResult.errors
              );
              authRateLimiter.recordAttempt(
                clientIP,
                email,
                "registration",
                false
              );

              // Provide a generic error message to prevent information leakage
              throw new Error("Registration failed. Please try again later.");
            }

            const newUser = createUserResult.data?.insert_users_one;
            if (!newUser) {
              authRateLimiter.recordAttempt(
                clientIP,
                email,
                "registration",
                false
              );
              throw new Error("Registration failed. Please try again later.");
            }

            // Record successful registration
            authRateLimiter.recordAttempt(
              clientIP,
              email,
              "registration",
              true
            );

            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              image: newUser.image,
            };
          } else {
            // Login flow with enhanced security
            const result = await secureDbQuery(GET_USER_BY_EMAIL_QUERY, {
              email,
            });
            const user = result.data?.users?.[0];

            if (!user) {
              authRateLimiter.recordAttempt(clientIP, email, "login", false);
              // Generic error message to prevent user enumeration
              throw new Error("Invalid email or password");
            }

            // Verify password - this also adds consistent timing
            const isValidPassword = await bcrypt.compare(
              password,
              user.password
            );

            if (!isValidPassword) {
              authRateLimiter.recordAttempt(clientIP, email, "login", false);
              // Generic error message to prevent user enumeration
              throw new Error("Invalid email or password");
            }

            // Handle MFA verification if enabled
            if (user.mfa_enabled) {
              // If MFA is required but no MFA code provided, request it
              if (!mfaCode && !backupCode) {
                authRateLimiter.recordAttempt(clientIP, email, "login", false);
                throw new Error("MFA_REQUIRED");
              }

              // Verify MFA code if provided
              if (mfaCode) {
                if (!user.mfa_secret) {
                  authRateLimiter.recordAttempt(clientIP, email, "mfa", false);
                  throw new Error(
                    "MFA setup incomplete. Please contact support."
                  );
                }

                const isValidMFA = authenticator.check(
                  mfaCode,
                  user.mfa_secret
                );
                if (!isValidMFA) {
                  authRateLimiter.recordAttempt(clientIP, email, "mfa", false);
                  throw new Error("Invalid MFA code");
                }
                authRateLimiter.recordAttempt(clientIP, email, "mfa", true);
              }

              // Verify backup code if provided
              if (backupCode) {
                // Query backup codes for this user
                const backupCodeQuery = `
                  query GetBackupCodes($userId: uuid!) {
                    user_backup_codes(where: {
                      user_id: {_eq: $userId}, 
                      used_at: {_is_null: true}
                    }) {
                      id
                      code_hash
                    }
                  }
                `;

                const backupResult = await secureDbQuery(backupCodeQuery, {
                  userId: user.id,
                });

                const backupCodes = backupResult.data?.user_backup_codes || [];
                let validBackupCode = null;

                // Check the provided backup code against all stored hashes
                for (const storedCode of backupCodes) {
                  const isValidBackupCode = await bcrypt.compare(
                    backupCode,
                    storedCode.code_hash
                  );
                  if (isValidBackupCode) {
                    validBackupCode = storedCode;
                    break;
                  }
                }

                if (!validBackupCode) {
                  authRateLimiter.recordAttempt(
                    clientIP,
                    email,
                    "backup_code",
                    false
                  );
                  throw new Error("Invalid backup code");
                }

                // Mark backup code as used
                const markUsedMutation = `
                  mutation MarkBackupCodeUsed($id: uuid!) {
                    update_user_backup_codes_by_pk(
                      pk_columns: {id: $id}, 
                      _set: {used_at: "now()"}
                    ) {
                      id
                    }
                  }
                `;

                await secureDbQuery(markUsedMutation, {
                  id: validBackupCode.id,
                });
                authRateLimiter.recordAttempt(
                  clientIP,
                  email,
                  "backup_code",
                  true
                );
              }
            }

            // Record successful login
            authRateLimiter.recordAttempt(clientIP, email, "login", true);

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            };
          }
        } catch (error) {
          // Enhanced error logging with security considerations
          if (process.env.NODE_ENV === "development") {
            console.error("Auth error details:", error);
          } else {
            // In production, log only non-sensitive information
            console.error(
              "Auth error:",
              error instanceof Error
                ? error.message
                : "Unknown authentication error"
            );
          }

          // Always throw the error to be handled by NextAuth
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
    session: async ({ session, token, user }): Promise<ExtendedSession> => {
      // For database sessions, user object is provided directly
      if (user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
          },
          userId: user.id,
          accessToken: "",
          dataFresh: true,
          userDataUpdatedAt: Date.now(),
        } as ExtendedSession;
      }

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
