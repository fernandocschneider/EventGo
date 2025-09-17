'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

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
  const [token, setToken] = useState<string | null>(null);
  const { data, loading, error } = useQuery(ME_QUERY, {
    skip: !token,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    window.location.href = '/';
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