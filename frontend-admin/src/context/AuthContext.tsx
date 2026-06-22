"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services";
import { tokenStorage } from "@/lib/api/client";
import { AuthUser } from "@/types/api/auth";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (user: AuthUser, accessToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const bootstrap = async () => {
      const accessToken = tokenStorage.getAccessToken();
      if (!accessToken) { setIsLoading(false); return; }
      try {
        const me = await authService.getMe();
        // Defensive re-check: a token for a non-admin role should never
        // grant a session here even if it somehow ended up in storage.
        if (me.role !== "ADMIN" && me.role !== "SUPER_ADMIN") {
          tokenStorage.clearTokens();
          setUser(null);
        } else {
          setUser(me);
        }
      } catch {
        tokenStorage.clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const setSession = useCallback((nextUser: AuthUser, accessToken: string) => {
    tokenStorage.setAccessToken(accessToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clearTokens();
    setUser(null);
    queryClient.clear();
    router.push("/login");
  }, [router, queryClient]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
