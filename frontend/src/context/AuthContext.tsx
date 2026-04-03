import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { login as apiLogin, getMe, type UserResponse } from "@/services/auth.service";
import { AUTH_TOKEN_KEY } from "@/utils/constants";

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<UserResponse>;
  logout: () => void;
  refreshMe: () => Promise<UserResponse | null>;
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

  const login = useCallback(async (email: string, password: string): Promise<UserResponse> => {
    const { access_token } = await apiLogin(email, password);
    localStorage.setItem(AUTH_TOKEN_KEY, access_token);
    const me = await getMe(access_token);
    setToken(access_token);
    setUser(me);
    return me;
  }, []);

  const refreshMe = useCallback(async (): Promise<UserResponse | null> => {
    const currentToken = token ?? localStorage.getItem(AUTH_TOKEN_KEY);
    if (!currentToken) return null;
    try {
      const me = await getMe(currentToken);
      setToken(currentToken);
      setUser(me);
      return me;
    } catch {
      return null;
    }
  }, [token]);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    getMe(stored)
      .then((me) => {
        setToken(stored);
        setUser(me);
      })
      .catch(() => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    logout,
    refreshMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
