"use client";

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

// Get API URL from environment variables or detect production
const getApiUrl = () => {
  // If NEXT_PUBLIC_API_URL is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // If we're in production (Railway), use the production API URL
  if (process.env.NODE_ENV === "production") {
    return "https://api-production-1a49.up.railway.app/graphql";
  }

  // Default to localhost for development
  return "http://localhost:4000/graphql";
};

const API_URL = getApiUrl();

// API URL configuration

const httpLink = createHttpLink({
  uri: API_URL,
  credentials: "include",
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
      fetchPolicy: "cache-first",
    },
    query: {
      errorPolicy: "all",
      fetchPolicy: "cache-first",
    },
  },
});
