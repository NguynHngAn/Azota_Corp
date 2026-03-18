import { createContext } from "react";

export type AppRole = "admin" | "teacher" | "student";

export type User = { id: string; email: string };
export type Session = { user: User } | null;

export interface AuthContextType {
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

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  role: null,
  profile: null,
  signOut: async () => {},
});

