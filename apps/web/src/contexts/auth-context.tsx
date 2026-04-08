'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  userId: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User, redirect?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });
  const router = useRouter();

  // Hydrate state from localStorage on mount to avoid SSR mismatch
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    let user = null;
    let token = null;

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        user = {
          userId: parsed.userId || parsed.id,
          username: parsed.username
        };
        token = savedToken;
      } catch (err: unknown) {
        console.error("Failed to parse saved user", err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    queueMicrotask(() => {
      setAuthState({
        user,
        token,
        isLoading: false
      });
    });
  }, []);

  const login = (newToken: string, newUser: { userId?: string; id?: string; username: string }, redirect?: string) => {
    const formattedUser: User = {
      userId: newUser.userId || newUser.id || '',
      username: newUser.username
    };

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(formattedUser));
    setAuthState({
      token: newToken,
      user: formattedUser,
      isLoading: false,
    });
    if (redirect !== undefined) {
       if (redirect) router.push(redirect);
    } else {
       router.push('/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      token: null,
      user: null,
      isLoading: false,
    });
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
