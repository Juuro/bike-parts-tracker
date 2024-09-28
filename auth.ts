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
    // Add user ID to the session
    session: async ({ session, token, user }) => {
      (session as any).accessToken = token.accessToken; // Pass accessToken to the session
      session.userId = token.sub ?? "";
      return session;
    },
  },
});
