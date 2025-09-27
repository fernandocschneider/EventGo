"use client";

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

// Debug: Log the API URL being used
console.log(
  "🔍 API URL:",
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql"
);

// TEMPORARY FIX: Hardcode the Railway API URL for testing
const API_URL = "https://api-production-1a49.up.railway.app/graphql";
console.log("🚀 Using hardcoded API URL:", API_URL);

const httpLink = createHttpLink({
  uri: API_URL,
});

const authLink = setContext((_, { headers }) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }

  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Event: {
        keyFields: false, // Desabilitar cache baseado em ID para evitar erros
      },
      Trip: {
        keyFields: ["id"],
        merge(existing, incoming) {
          if (existing && incoming && existing.id === incoming.id) {
            return { ...existing, ...incoming };
          }
          return incoming;
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});
