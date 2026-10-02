"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";

type Mode = "login" | "signup";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const router = useRouter();
  const { login, signup, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState<"email" | "google" | null>(null);

  const emailValid = EMAIL_RE.test(email.trim());
  const passwordValid = password.length >= 8;
  const nameValid = fullName.trim().length >= 2;
  const canSubmit =
    pending === null &&
    emailValid &&
    passwordValid &&
    (mode === "login" || nameValid);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setFormError(null);
    if (!canSubmit || pending) return;
    setPending("email");
    try {
      if (mode === "login") await login(email.trim(), password);
      else await signup(fullName.trim(), email.trim(), password);
      router.push("/dashboard");
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setPending(null);
    }
  };

  const handleGoogle = async () => {
    setFormError(null);
    setPending("google");
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch {
      setFormError("Google sign-in failed. Please try again.");
    } finally {
      setPending(null);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setTouched(false);
    setFormError(null);
  };

  const fieldClass = (valid: boolean) =>
    `input-base ${touched ? (valid ? "input-valid" : "input-invalid") : ""}`;

  const spin = (
    <span
      className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
      aria-hidden="true"
    />
  );

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-6">
      <div className="card-border rounded-modal bg-surface p-6 sm:p-8">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-card bg-primary text-xl font-bold text-white">
            C
          </span>
          <h1 className="mt-4 font-lexend text-2xl font-bold tracking-tight sm:text-3xl">
            {mode === "login" ? "Welcome back 👋" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {mode === "login"
              ? "Log in to access your past audits and reports."
              : "Sign up to save audits, track your score and download reports."}
          </p>
        </div>

        <div
          className="mt-6 grid grid-cols-2 gap-1 rounded-card bg-background p-1 text-sm font-semibold"
          role="tablist"
          aria-label="Login or signup"
        >
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={`min-h-[48px] rounded-card transition ${
                mode === m ? "bg-primary text-white" : "text-white/60 hover:text-white"
              }`}
            >
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={pending !== null}
          className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-card border border-white/20 bg-background px-4 py-3 text-sm font-semibold transition hover:border-primary/60 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending === "google" ? spin : (
            <span
              aria-hidden="true"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-black"
            >
              G
            </span>
          )}
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-white/40" aria-hidden="true">
          <span className="h-px flex-1 bg-white/10" />
          OR WITH EMAIL
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleEmailSubmit} noValidate className="flex flex-col gap-4">
          {mode === "signup" && (
            <div>
              <label htmlFor="full-name" className="mb-1 block text-sm font-medium">
                Full name
              </label>
              <input
                id="full-name"
                type="text"
                autoComplete="name"
                placeholder="Ada Lovelace"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                aria-invalid={touched && !nameValid}
                className={fieldClass(nameValid)}
              />
              {touched && !nameValid && (
                <p className="mt-1 text-xs text-danger" role="alert">
                  Please enter your name.
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={touched && !emailValid}
              className={fieldClass(emailValid)}
            />
            {touched && !emailValid && (
              <p className="mt-1 text-xs text-danger" role="alert">
                Enter a valid email address.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={touched && !passwordValid}
                className={`${fieldClass(passwordValid)} pr-16`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 min-h-[48px] min-w-[48px] -translate-y-1/2 rounded-card px-2 text-xs font-semibold text-white/60 transition hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {touched && !passwordValid && (
              <p className="mt-1 text-xs text-danger" role="alert">
                Password must be at least 8 characters.
              </p>
            )}
          </div>

          {formError && (
            <p
              className="rounded-card border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-card bg-primary px-6 py-3 font-semibold text-white transition duration-200 hover:scale-[1.01] hover:bg-accent active:scale-[0.99] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending === "email" && spin}
            {pending === "email"
              ? "Processing…"
              : mode === "login"
                ? "Log in"
                : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs leading-relaxed text-white/50">
          Demo mode: any valid email + 8-char password works.
          <br />
          Firebase Auth wiring comes next — nothing leaves your browser.
        </p>

        <p className="mt-4 text-center text-sm">
          <Link href="/" className="font-semibold text-accent transition hover:text-primary">
            ← Back to upload
          </Link>
        </p>
      </div>
    </div>
  );
}
