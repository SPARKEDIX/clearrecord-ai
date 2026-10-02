"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/lib/auth/AuthContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      setOpen(false);
      router.push("/");
    }
  };

  return (
    <header className="force-dark sticky top-0 z-40 border-b border-white/10 bg-secondary">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="ClearRecord AI home">
          <span className="flex h-9 w-9 items-center justify-center rounded-card bg-primary text-lg font-bold text-white">
            C
          </span>
          <span className="font-lexend text-lg font-bold tracking-tight text-white">
            ClearRecord <span className="text-primary">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex" aria-label="Primary">
          <Link href="/" className="transition hover:text-white">
            Upload
          </Link>
          <Link href="/dashboard" className="transition hover:text-white">
            Dashboard
          </Link>
          <Link href="/score" className="transition hover:text-white">
            Score
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {!user ? (
            <Link
              href="/login"
              className="inline-flex min-h-[48px] items-center justify-center rounded-card bg-primary px-5 py-2 text-sm font-semibold text-white transition duration-200 hover:scale-[1.02] hover:bg-accent active:scale-[0.98] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Log in
            </Link>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                className="flex min-h-[48px] min-w-[48px] items-center gap-2 rounded-card border border-white/10 bg-surface px-3 py-2 text-sm font-medium text-white transition hover:border-primary/60 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">
                  {user.full_name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline">{user.full_name}</span>
                <span aria-hidden="true" className="text-white/60">
                  ▾
                </span>
              </button>

              {open && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-48 overflow-hidden rounded-modal border border-white/10 bg-surface text-white shadow-xl"
                >
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="truncate text-sm font-semibold">{user.full_name}</p>
                    <p className="truncate text-xs text-white/60">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    role="menuitem"
                    className="block px-4 py-3 text-sm transition hover:bg-white/5"
                    onClick={() => setOpen(false)}
                  >
                    My audits
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-4 py-3 text-left text-sm text-white/70 transition hover:bg-white/5"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

