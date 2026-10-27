"use client";

import { useCallback, useEffect, useState } from "react";
import { BACKEND_URL } from "@/app/config";

export interface AuthUser {
  id?: string;
  userId?: string;
  name?: string;
  email?: string;
  photo?: string | null;
}

/**
 * Reusable hook to check and observe user session against /api/auth/me.
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        setUser(null);
        return null;
      }

      const data: AuthUser = await response.json();
      setUser(data);
      return data;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return {
    user,
    isAuthenticated: user !== null,
    isCheckingAuth,
    checkSession,
    setUser,
  };
}
