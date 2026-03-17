import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

type AppRole = "admin" | "teacher" | "student";

type User = { id: string; email: string };
type Session = { user: User } | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
  profile: {
    display_name: string;
    email: string;
    avatar_url: string | null;
    school: string | null;
  } | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  role: null,
  profile: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state] = useState(() => {
    const raw = localStorage.getItem("eduflow-mock-auth");
    const fallback = {
      user: { id: "dev", email: "dev@local" } satisfies User,
      role: "teacher" satisfies AppRole,
      profile: {
        display_name: "Dev User",
        email: "dev@local",
        avatar_url: null,
        school: null,
      } satisfies AuthContextType["profile"],
    };

    if (!raw) return fallback;

    try {
      const parsed = JSON.parse(raw) as Partial<{
        user: User;
        role: AppRole;
        profile: AuthContextType["profile"];
      }>;
      return {
        user: parsed.user ?? fallback.user,
        role: parsed.role ?? fallback.role,
        profile: parsed.profile ?? fallback.profile,
      };
    } catch {
      return fallback;
    }
  });

  const user = state.user;
  const session: Session = { user };
  const loading = false;
  const role = state.role;
  const profile = state.profile;

  const signOut = async () => {
    localStorage.removeItem("eduflow-mock-auth");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, role, profile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
