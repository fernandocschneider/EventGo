"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { useRouter } from "next/navigation";

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
      avatarUrl
    }
  }
`;

export function useAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sempre executar o useQuery, mas com skip baseado no token
  const { data, loading, error, refetch } = useQuery(ME_QUERY, {
    skip: !token || !isInitialized,
    errorPolicy: "all",
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
      setIsInitialized(true);
    }
  }, []);

  const login = async (newToken: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", newToken);
    }
    setToken(newToken);
    // Forçar reload para garantir que o estado seja atualizado
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setToken(null);
    router.push("/");
  };

  // Debug logs
  console.log("🔍 Auth Debug:", {
    token: !!token,
    user: data?.me,
    loading,
    error,
    isAuthenticated: !!token && !error,
  });

  return {
    user: data?.me,
    isAuthenticated: !!token && !error,
    isLoading: loading || !isInitialized,
    error,
    login,
    logout,
  };
}
