import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ApiError } from "@/api/client";
import {
  login as apiLogin,
  getMe,
  refreshWithToken,
  type UserResponse,
} from "@/services/auth.service";
import { AUTH_REFRESH_TOKEN_KEY, AUTH_TOKEN_KEY } from "@/utils/constants";

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
}

export type LoginOptions = {
  /**
   * When true (default): tokens live in localStorage; the server issues a long-lived refresh JWT
   * (30 days by default) so access tokens can be renewed until that window ends.
   * When false: tokens use sessionStorage with a shorter refresh lifetime; closing the tab ends the session.
   */
  rememberMe?: boolean;
};

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, options?: LoginOptions) => Promise<UserResponse>;
  logout: () => void;
  refreshMe: () => Promise<UserResponse | null>;
}

type TokenBootstrap =
  | { mode: "full"; access: string; refresh: string; rememberMe: boolean }
  | { mode: "legacy"; access: string; rememberMe: boolean };

function normalizeOrphans(store: Storage): void {
  const access = store.getItem(AUTH_TOKEN_KEY);
  const refresh = store.getItem(AUTH_REFRESH_TOKEN_KEY);
  if (refresh && !access) {
    store.removeItem(AUTH_REFRESH_TOKEN_KEY);
  }
}

function readTokenBootstrap(): TokenBootstrap | null {
  normalizeOrphans(localStorage);
  normalizeOrphans(sessionStorage);

  const la = localStorage.getItem(AUTH_TOKEN_KEY);
  const lr = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
  if (la && lr) return { mode: "full", access: la, refresh: lr, rememberMe: true };
  if (la) return { mode: "legacy", access: la, rememberMe: true };

  const sa = sessionStorage.getItem(AUTH_TOKEN_KEY);
  const sr = sessionStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
  if (sa && sr) return { mode: "full", access: sa, refresh: sr, rememberMe: false };
  if (sa) return { mode: "legacy", access: sa, rememberMe: false };

  return null;
}

function clearStoredToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
}

function writeStoredToken(accessToken: string, refreshToken: string, rememberMe: boolean): void {
  if (rememberMe) {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    sessionStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    sessionStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
  }
}

async function hydrateFromBootstrap(
  boot: TokenBootstrap,
  setToken: (t: string) => void,
  setUser: (u: UserResponse) => void,
): Promise<void> {
  const apply = (access: string, me: UserResponse) => {
    setToken(access);
    setUser(me);
  };
  try {
    const me = await getMe(boot.access);
    apply(boot.access, me);
    return;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401 && boot.mode === "full") {
      try {
        const { access_token, refresh_token } = await refreshWithToken(boot.refresh);
        writeStoredToken(access_token, refresh_token, boot.rememberMe);
        const me = await getMe(access_token);
        apply(access_token, me);
        return;
      } catch {
        clearStoredToken();
        return;
      }
    }
    clearStoredToken();
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearStoredToken();
  }, []);

  const login = useCallback(async (email: string, password: string, options?: LoginOptions): Promise<UserResponse> => {
    const rememberMe = options?.rememberMe !== false;
    const { access_token, refresh_token } = await apiLogin(email, password, rememberMe);
    writeStoredToken(access_token, refresh_token, rememberMe);
    const me = await getMe(access_token);
    setToken(access_token);
    setUser(me);
    return me;
  }, []);

  const refreshMe = useCallback(async (): Promise<UserResponse | null> => {
    const boot = readTokenBootstrap();
    const access = token ?? boot?.access ?? null;
    if (!access) return null;
    try {
      const me = await getMe(access);
      setToken(access);
      setUser(me);
      return me;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401 && boot?.mode === "full") {
        try {
          const { access_token, refresh_token } = await refreshWithToken(boot.refresh);
          writeStoredToken(access_token, refresh_token, boot.rememberMe);
          const me = await getMe(access_token);
          setToken(access_token);
          setUser(me);
          return me;
        } catch {
          logout();
          return null;
        }
      }
      return null;
    }
  }, [logout, token]);

  useEffect(() => {
    const boot = readTokenBootstrap();
    if (!boot) {
      setLoading(false);
      return;
    }
    void hydrateFromBootstrap(boot, setToken, setUser).finally(() => setLoading(false));
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
