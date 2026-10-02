"use client";

import Link from "next/link";
import { useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import AuditList from "@/components/dashboard/AuditList";
import DashboardState from "@/components/dashboard/DashboardState";
import { useAudits } from "@/lib/hooks/useAudits";
import { averageScore, totalRemoved } from "@/lib/utils/dashboard";
import { MOCK_USER } from "@/lib/mock/dashboardMock";

export default function DashboardPage() {
  // Demo switcher to preview Loading / Empty / Error states from the PRD.
  // Remove once wired to Firebase Auth + Firestore.
  const [preview, setPreview] = useState<"data" | "empty" | "error">("data");
  const query = useAudits(preview);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
      {/* Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-lexend text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back, {MOCK_USER.full_name} 👋
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/60 sm:text-base">
            Here&apos;s your scan history and Digital Hygiene progress. Start a new audit
            anytime to keep your profile employer-ready.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-card bg-primary px-6 py-3 font-semibold text-white transition duration-200 ease-out hover:scale-[1.02] hover:bg-accent active:scale-[0.98] active:bg-[#169c46] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          <span aria-hidden="true">＋</span> New audit
        </Link>
      </div>

      {/* Demo state preview (temporary) */}
      <div className="card-border mt-6 flex flex-wrap items-center gap-2 rounded-card bg-surface p-3 text-xs text-white/60">
        <span className="font-semibold text-white/80">Preview states:</span>
        {(["data", "empty", "error"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setPreview(m)}
            aria-pressed={preview === m}
            className={`min-h-[48px] rounded-card px-4 py-2 font-semibold transition sm:min-h-0 sm:py-2 ${
              preview === m
                ? "bg-primary text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {m === "data" ? "With audits" : m === "empty" ? "Empty" : "Error"}
          </button>
        ))}
      </div>

      {query.status === "loading" && <DashboardState variant="loading" />}

      {query.status === "error" && (
        <DashboardState variant="error" onRetry={() => setPreview("data")} />
      )}

      {query.status === "success" && query.audits.length === 0 && (
        <DashboardState variant="empty" />
      )}

      {query.status === "success" && query.audits.length > 0 && (
        <>
          {/* Stats cards: 1-col mobile → 2-col tablet → 3-col desktop */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total audits"
              value={String(query.audits.length)}
              hint="Scans completed on your archives"
            />
            <StatCard
              label="Average score"
              value={String(averageScore(query.audits) ?? "—")}
              hint="Mean Digital Hygiene Score (0–100)"
            />
            <StatCard
              label="Flagged items found"
              value={String(totalRemoved(query.audits))}
              hint="Risky items surfaced across audits"
            />
          </div>

          <AuditList audits={query.audits} />
        </>
      )}

      {/* Mobile floating action button for New audit */}
      <Link
        href="/"
        aria-label="Start a new audit"
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white shadow-xl transition hover:scale-105 hover:bg-accent active:scale-95 sm:hidden"
      >
        ＋
      </Link>
    </div>
  );
}
