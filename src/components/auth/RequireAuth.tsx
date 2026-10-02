"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import type { ReactNode } from "react";

/**
 * Auth gate for the upload flow.
 *
 * PRD: the upload button must only work for signed-in users; everyone else is
 * shown the login page. While Firebase restores the session we render a
 * neutral placeholder so the button never flashes in the wrong state.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();
  const router = useRouter();

  if (initializing) {
    return (
      <div className="card-border rounded-modal bg-surface px-6 py-16 text-center">
        <p className="text-sm text-white/60">Checking your session…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card-border rounded-modal bg-surface px-6 py-14 text-center sm:px-10">
        <p className="text-4xl" aria-hidden="true">
          🔒
        </p>
        <h2 className="mt-4 font-lexend text-xl font-bold sm:text-2xl">
          Log in to upload your archive
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
          Your archive is private to you. Create a free account (or continue with Google) to
          run an AI risk scan and keep your audit history.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-card bg-primary px-6 py-3 font-semibold text-white transition duration-200 hover:scale-[1.02] hover:bg-accent active:scale-[0.98] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:w-auto"
          >
            Log in / Sign up
          </button>
          <Link
            href="/dashboard"
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-card border border-white/20 bg-background px-6 py-3 font-semibold text-white/80 transition hover:bg-white/5 sm:w-auto"
          >
            View demo dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}