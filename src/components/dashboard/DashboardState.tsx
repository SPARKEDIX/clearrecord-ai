"use client";

import Link from "next/link";

interface Props {
  variant: "loading" | "empty" | "error";
  onRetry?: () => void;
}

export default function DashboardState({ variant, onRetry }: Props) {
  if (variant === "loading") {
    return (
      <div className="mt-8 flex flex-col gap-4" role="status" aria-label="Loading audit history">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="card-border animate-pulse rounded-card bg-surface p-5"
            aria-hidden="true"
          >
            <div className="h-5 w-32 rounded bg-white/10" />
            <div className="mt-3 h-4 w-48 rounded bg-white/10" />
          </div>
        ))}
        <p className="sr-only">Loading audit history…</p>
      </div>
    );
  }

  if (variant === "empty") {
    return (
      <div className="card-border mt-8 rounded-modal bg-surface px-6 py-16 text-center">
        <p className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-3xl">
          🌱
        </p>
        <h2 className="mt-4 font-lexend text-2xl font-bold">Start your first audit</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
          Upload your social media archive and we&apos;ll scan it against 13 employer
          risk categories in minutes.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-card bg-primary px-6 py-3 font-semibold text-white transition duration-200 hover:scale-[1.02] hover:bg-accent active:scale-[0.98] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Start your first audit
        </Link>
      </div>
    );
  }

  return (
    <div
      className="card-border mt-8 rounded-modal bg-surface px-6 py-16 text-center"
      role="alert"
    >
      <p className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/15 text-3xl">
        ⚠️
      </p>
      <h2 className="mt-4 font-lexend text-2xl font-bold">Couldn&apos;t load your audits</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
        Something went wrong while fetching your scan history. Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-card bg-primary px-6 py-3 font-semibold text-white transition duration-200 hover:scale-[1.02] hover:bg-accent active:scale-[0.98] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        Retry
      </button>
    </div>
  );
}
