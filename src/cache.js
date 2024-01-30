import { InMemoryCache, makeVar } from "@apollo/client";

export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        user: {
          read() {
            return userVar();
          },
        },
        token: {
          read() {
            return tokenVar();
          },
        },
      },
    },
  },
});

export const userVar = makeVar(null);
export const tokenVar = makeVar("");
