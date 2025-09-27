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
  const { data, loading, error } = useQuery(ME_QUERY, {
    skip: !token,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

  const login = (newToken: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", newToken);
    }
    setToken(newToken);
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setToken(null);
    router.push("/");
  };

  return {
    user: data?.me,
    isAuthenticated: !!token && !!data?.me,
    isLoading: loading,
    error,
    login,
    logout,
  };
}
