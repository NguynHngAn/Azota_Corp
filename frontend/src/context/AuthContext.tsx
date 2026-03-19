import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AUTH_TOKEN_KEY } from "../utils/constants";
import { authService } from "@/services/auth.service";
import type { UserResponse } from "@/services/types";

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<UserResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<UserResponse> => {
      const tokenRes = await authService.login(email, password);
      if (!tokenRes.success || !tokenRes.data) {
        throw new Error(tokenRes.message || "Login failed");
      }
      const { access_token } = tokenRes.data;
      localStorage.setItem(AUTH_TOKEN_KEY, access_token);
      const meRes = await authService.me(access_token);
      if (!meRes.success || !meRes.data) {
        throw new Error(meRes.message || "Failed to load profile");
      }
      const me = meRes.data;
      setToken(access_token);
      setUser(me);
      return me;
    },
    [],
  );

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    authService
      .me(stored)
      .then((res) => {
        if (!res.success || !res.data) throw new Error(res.message || "Failed");
        setToken(stored);
        setUser(res.data);
      })
      .catch(() => localStorage.removeItem(AUTH_TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
