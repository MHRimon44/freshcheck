import { createContext } from "react";
import type { User } from "firebase/auth";
export interface AuthState {
  user: User | null;
  loading: boolean;
  displayName: string;
  updateName: (name: string) => Promise<void>;
  changePassword: (currentPassword: string, password: string, confirmation: string) => Promise<void>;
  initializationError: string;
  profileError: string;
  signUp: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  repairProfile: () => Promise<void>;
}
export const AuthContext = createContext<AuthState | undefined>(undefined);
