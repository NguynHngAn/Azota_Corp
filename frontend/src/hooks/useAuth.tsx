import { useState, type ReactNode } from "react";
import {
  AuthContext,
  type AppRole,
  type AuthContextType,
  type Session,
  type User,
} from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state] = useState<{
    user: User;
    role: AppRole;
    profile: AuthContextType["profile"];
  }>(() => {
    const raw = localStorage.getItem("eduflow-mock-auth");
    const fallback: {
      user: User;
      role: AppRole;
      profile: AuthContextType["profile"];
    } = {
      user: { id: "dev", email: "dev@local" },
      role: "teacher",
      profile: {
        display_name: "Dev User",
        email: "dev@local",
        avatar_url: null,
        school: null,
      },
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

// `useAuth` is exported from `src/hooks/useAuthContext.ts` to keep Fast Refresh happy.
