"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  provider: "email" | "google";
}

export interface AuthError {
  code: string;
  message: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  initializing: boolean;
  authError: AuthError | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (fullName: string, email: string, password: string) => Promise<AuthUser>;
  loginWithGoogle: () => Promise<AuthUser>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
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

function readCachedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function toAuthUser(fb: FirebaseUser, fallbackName?: string): AuthUser {
  const email = fb.email ?? "";
  const provider: AuthUser["provider"] = fb.providerData.some(
    (p) => p.providerId === "google.com"
  )
    ? "google"
    : "email";
  return {
    id: fb.uid,
    email,
    full_name: fb.displayName?.trim() || fallbackName?.trim() || nameFromEmail(email),
    provider
  };
}

function friendlyError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support.";
    case "auth/user-not-found":
      return "No account found with this email. Try signing up instead.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password. Please try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try logging in.";
    case "auth/weak-password":
      return "Password is too weak — use at least 8 characters.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before finishing. Try again.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google popup. Allow popups and retry.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/operation-not-allowed":
      return "This sign-in method isn't enabled in Firebase Console. Enable it under Authentication → Sign-in method.";
    case "auth/unauthorized-domain":
      return "This domain isn't authorized in Firebase Console. Add it under Authentication → Settings → Authorized domains.";
    default:
      return "Something went wrong. Please try again.";
  }
}
/**
 * Firebase-backed auth (PRD Should-Have: email/password + Google Sign-In).
 * The cached localStorage profile keeps first paint fast while Firebase
 * restores the real session via onAuthStateChanged.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    typeof window === "undefined" ? null : readCachedUser()
  );
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      (fb) => {
        if (fb) {
          const next = toAuthUser(fb);
          persist(next);
          setUser(next);
        } else {
          persist(null);
          setUser(null);
        }
        setInitializing(false);
      },
      () => setInitializing(false)
    );
    return () => unsub();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const next = toAuthUser(cred.user);
      persist(next);
      setUser(next);
      return next;
    } catch (err) {
      const code = (err as { code?: string }).code ?? "auth/unknown";
      setAuthError({ code, message: friendlyError(code) });
      throw err;
    }
  }, []);

  const signup = useCallback(async (fullName: string, email: string, password: string) => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const trimmed = fullName.trim();
      if (trimmed && cred.user.displayName !== trimmed) {
        try {
          await updateProfile(cred.user, { displayName: trimmed });
        } catch {
          // Non-fatal — name just won't be stored on the Firebase profile.
        }
      }
      const next = toAuthUser(cred.user, trimmed);
      persist(next);
      setUser(next);
      return next;
    } catch (err) {
      const code = (err as { code?: string }).code ?? "auth/unknown";
      setAuthError({ code, message: friendlyError(code) });
      throw err;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      const next = toAuthUser(cred.user);
      persist(next);
      setUser(next);
      return next;
    } catch (err) {
      const code = (err as { code?: string }).code ?? "auth/unknown";
      setAuthError({ code, message: friendlyError(code) });
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } finally {
      persist(null);
      setUser(null);
    }
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, initializing, authError, login, signup, loginWithGoogle, logout, clearAuthError }}
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
