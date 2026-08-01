"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LoginPayload, PublicUser } from "@/src/api/auth.api";
import { authService } from "@/src/services/auth.service";
import { userService } from "@/src/services/user.service";
import { onUnauthorized } from "@/src/utils/authEvents";
import { getToken, removeToken, isAuthenticated as hasToken } from "@/src/utils/token";

export type AuthContextValue = {
  user: PublicUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<PublicUser>;
  googleLogin: (idToken: string) => Promise<PublicUser>;
  logout: () => void;
  refreshUser: () => Promise<PublicUser | null>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

async function loadCurrentUser(): Promise<PublicUser | null> {
  if (!getToken()) return null;
  try {
    const response = await userService.getMe();
    // Backend contract: { success, message, data: { user } }
    return response.data?.user ?? null;
  } catch {
    removeToken();
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<PublicUser | null> => {
    const nextUser = await loadCurrentUser();
    setUser(nextUser);
    return nextUser;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!hasToken()) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const nextUser = await loadCurrentUser();
      if (!cancelled) {
        setUser(nextUser);
        setLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  // Axios 401 → token already removed in interceptor; clear in-memory user too
  useEffect(() => {
    return onUnauthorized(() => {
      setUser(null);
    });
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    await authService.login(payload);
    const nextUser = await loadCurrentUser();
    if (!nextUser) {
      throw new Error("Login succeeded but profile could not be loaded.");
    }
    setUser(nextUser);
    return nextUser;
  }, []);

  const googleLogin = useCallback(async (idToken: string) => {
    await authService.google({ idToken });
    const nextUser = await loadCurrentUser();
    if (!nextUser) {
      throw new Error("Google login succeeded but profile could not be loaded.");
    }
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user) && hasToken(),
      login,
      googleLogin,
      logout,
      refreshUser,
    }),
    [user, loading, login, googleLogin, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
