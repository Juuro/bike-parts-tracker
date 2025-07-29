import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { HasuraAdapter } from "@auth/hasura-adapter";
import { SignJWT } from "jose";

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  providers: [Google],
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
    // Add user ID to the session and fetch latest user data
    session: async ({ session, token, user }) => {
      (session as any).accessToken = token.accessToken; // Pass accessToken to the session
      session.userId = token.sub ?? "";
      
      // Fetch the latest user data from the database to ensure session is up-to-date
      if (token.sub) {
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
              variables: { userId: token.sub }
            }),
          });
          
          if (response.ok) {
            const result = await response.json();
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
            }
          }
        } catch (error) {
          console.error("Error fetching user data in session callback:", error);
          // Fall back to existing session data if there's an error
        }
      }
      
      return session;
    },
  },
});
