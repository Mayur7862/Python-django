// src/apollo.ts
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({ uri: "http://localhost:8000/graphql/" });

const orgLink = setContext((_, { headers }) => {
  const orgSlug = localStorage.getItem("orgSlug") || "acme";
  return { headers: { ...headers, "X-Org-Slug": orgSlug } };
});

export const client = new ApolloClient({
  link: orgLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      ProjectType: { keyFields: ["id"] },
      TaskType: { keyFields: ["id"] },
    },
  }),
});
