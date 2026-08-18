import * as React from "react";
import type { User, LoginCredentials, LoginResponse } from "@/types/user";
import * as authService from "@/features/auth/services/auth.service";

type AuthUser = Omit<User, "pin_hash">;

interface StoredSession {
  user: AuthUser;
  session_token: string;
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

const SESSION_STORAGE_KEY = "petora_session";

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
);

function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (parsed.user && parsed.session_token) return parsed;
    return null;
  } catch {
    return null;
  }
}

function writeStoredSession(session: StoredSession): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearStoredSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [sessionToken, setSessionToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const stored = readStoredSession();
    if (stored) {
      setUser(stored.user);
      setSessionToken(stored.session_token);
    }
    setIsLoading(false);
  }, []);

  const login = React.useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    const session: StoredSession = {
      user: response.user,
      session_token: response.session_token,
    };
    setUser(response.user);
    setSessionToken(response.session_token);
    writeStoredSession(session);
    return response;
  }, []);

  const logout = React.useCallback(async () => {
    const token = sessionToken;
    setUser(null);
    setSessionToken(null);
    clearStoredSession();
    if (token) {
      try {
        await authService.logout(token);
      } catch {
        // state already cleared; swallow API error
      }
    }
  }, [sessionToken]);

  const changePin = React.useCallback(
    async (oldPin: string, newPin: string) => {
      if (!user) throw new Error("Not authenticated");
      await authService.changePin(user.id, oldPin, newPin);
    },
    [user],
  );

  const resetPin = React.useCallback(
    async (targetUserId: string, newPin: string) => {
      if (!user) throw new Error("Not authenticated");
      await authService.resetPin(user.id, targetUserId, newPin);
    },
    [user],
  );

  const refreshUser = React.useCallback(async () => {
    if (!sessionToken) return;
    const stored = readStoredSession();
    if (stored) {
      setUser(stored.user);
    }
  }, [sessionToken]);

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
    [user, isLoading, login, logout, changePin, resetPin, refreshUser],
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
