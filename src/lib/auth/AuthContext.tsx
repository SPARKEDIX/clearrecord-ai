"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  provider: "email" | "google";
}

interface AuthContextValue {
  user: AuthUser | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (fullName: string, email: string, password: string) => Promise<AuthUser>;
  loginWithGoogle: () => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "clearrecord-auth-user";

function persist(user: AuthUser | null) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors — session just won't persist.
  }
}

function nameFromEmail(email: string): string {
  const raw = email.split("@")[0] ?? "User";
  const cleaned = raw.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "User";
  return cleaned
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Demo auth until Firebase Auth is wired (PRD Should-Have: email/password +
 * Google Sign-In). Any valid-looking credentials succeed; the session is kept
 * in localStorage only — nothing leaves the browser.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      // Corrupt entry — start logged out.
    }
    setInitializing(false);
  }, []);

  const login = useCallback(async (email: string) => {
    await delay(800);
    const next: AuthUser = {
      id: `demo-${Date.now()}`,
      email,
      full_name: nameFromEmail(email),
      provider: "email"
    };
    persist(next);
    setUser(next);
    return next;
  }, []);

  const signup = useCallback(async (fullName: string, email: string) => {
    await delay(900);
    const next: AuthUser = {
      id: `demo-${Date.now()}`,
      email,
      full_name: fullName,
      provider: "email"
    };
    persist(next);
    setUser(next);
    return next;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await delay(900);
    const next: AuthUser = {
      id: `demo-google-${Date.now()}`,
      email: "kartik.demo@gmail.com",
      full_name: "Kartik",
      provider: "google"
    };
    persist(next);
    setUser(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    persist(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, initializing, login, signup, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
