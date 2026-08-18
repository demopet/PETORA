import * as React from "react";
import type { User, LoginCredentials, LoginResponse } from "@/types/user";

type AuthUser = Omit<User, "pin_hash">;

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

interface StoredSession {
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (_credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  changePin: (_oldPin: string, _newPin: string) => Promise<void>;
  resetPin: (_targetUserId: string, _newPin: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

function readStoredSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem("petora_session");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (parsed.user) return parsed;
    return null;
  } catch {
    return null;
  }
}

function writeStoredSession(session: StoredSession): void {
  sessionStorage.setItem("petora_session", JSON.stringify(session));
}

function clearStoredSession(): void {
  sessionStorage.removeItem("petora_session");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const stored = readStoredSession();
    if (stored) {
      setUser(stored.user);
    }
    setIsLoading(false);
  }, []);

  const login = React.useCallback(async (credentials: LoginCredentials) => {
    const response = await fetch(`${EDGE_FUNCTION_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();
    const session: StoredSession = { user: data.user };
    setUser(data.user);
    writeStoredSession(session);
    return { user: data.user, session_token: "" };
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await fetch(`${EDGE_FUNCTION_URL}/auth/logout`, {
        method: "POST",
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        credentials: "include",
      });
    } catch {
      // state will be cleared below
    }
    setUser(null);
    clearStoredSession();
  }, []);

  const changePin = React.useCallback(
    async (oldPin: string, newPin: string) => {
      if (!user) throw new Error("Not authenticated");
      // PIN changes still go through direct RPC since they require the current session
      const { changePin: changePinService } = await import("@/features/auth/services/auth.service");
      await changePinService(user.id, oldPin, newPin);
    },
    [user]
  );

  const resetPin = React.useCallback(
    async (targetUserId: string, newPin: string) => {
      if (!user) throw new Error("Not authenticated");
      const { resetPin: resetPinService } = await import("@/features/auth/services/auth.service");
      await resetPinService(user.id, targetUserId, newPin);
    },
    [user]
  );

  const refreshUser = React.useCallback(async () => {
    const response = await fetch(`${EDGE_FUNCTION_URL}/auth/session`, {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      if (data.user) {
        const session: StoredSession = { user: data.user };
        setUser(data.user);
        writeStoredSession(session);
        return;
      }
    }

    setUser(null);
    clearStoredSession();
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      logout,
      changePin,
      resetPin,
      refreshUser,
    }),
    [user, isLoading, login, logout, changePin, resetPin, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export type { AuthContextValue };
