"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/lib/auth/AuthContext";
import { RISK_CATEGORY_LABELS, RISK_LEVEL_COLORS, scoreColor } from "@/lib/constants/risks";
import {
  categoryBreakdown,
  loadScanSession,
  scoreWithActions,
  type ScanSession
} from "@/lib/scan/scanSession";

export default function ScorePage() {
  const { user } = useAuth();
  const [session, setSession] = useState<ScanSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<"full" | "redacted" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSession(loadScanSession());
    setLoaded(true);
  }, []);

  const download = async (redacted: boolean) => {
    if (!session) return;
    setBusy(redacted ? "redacted" : "full");
    setError(null);
    try {
      const [{ default: pdfMake }, { buildReportDoc }] = await Promise.all([
        import("pdfmake/build/pdfmake"),
        import("@/lib/report/buildReport")
      ]);
      const vfs = await import("pdfmake/build/vfs_fonts");
      (pdfMake as unknown as { vfs: unknown }).vfs = (
        vfs as unknown as { pdfMake: { vfs: unknown } }
      ).pdfMake.vfs;

      pdfMake
        .createPdf(buildReportDoc(session, user?.full_name ?? "Candidate", redacted))
        .download(
          "clearrecord-report-" + (redacted ? "employer" : "full") + ".pdf"
        );
    } catch {
      setError("Could not generate the PDF. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  if (!loaded) return null;

  if (!session) {
    return (
      <RequireAuth>
        <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
          <h1 className="font-lexend text-3xl font-bold tracking-tight sm:text-4xl">
            Score &amp; Report
          </h1>
          <div className="card-border mt-8 rounded-modal bg-surface px-6 py-16 text-center">
            <p className="font-lexend text-6xl font-bold text-white/30">—</p>
            <p className="mx-auto mt-4 max-w-md text-sm text-white/60">
              No completed audit yet. Run an audit from the upload page first, then come
              back to see your score breakdown here.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-card bg-primary px-6 py-3 font-semibold text-white transition hover:bg-accent"
            >
              Start an audit
            </Link>
          </div>
        </div>
      </RequireAuth>
    );
  }

  const score = scoreWithActions(session.items, session.score);
  const breakdown = categoryBreakdown(session.items);
  const maxCount = Math.max(1, ...breakdown.map((b) => b.count));

  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
        <h1 className="font-lexend text-3xl font-bold tracking-tight sm:text-4xl">
          Score &amp; Report
        </h1>
        <p className="mt-2 text-sm text-white/60">
          {session.fileName} · {session.totalScanned} items scanned ·{" "}
          {session.aiUsed ? "AI-screened" : "keyword fallback"}
        </p>

        <div className="card-border mt-8 rounded-modal bg-surface p-6 text-center sm:p-10">
          <p className="text-sm uppercase tracking-wider text-white/50">Digital Hygiene Score</p>
          <p className="mt-2 font-lexend text-7xl font-bold" style={{ color: scoreColor(score) }}>
            {score}
          </p>
          <p className="mt-1 text-sm text-white/60">out of 100</p>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/70">
            {score >= 80
              ? "Looking good. Review the medium-risk items below and your profile is employer-ready."
              : score >= 50
                ? "There is room to improve. Start with the high-risk items — they matter most to screeners."
                : "Several high-risk items were found. Clearing these will make the biggest difference."}
          </p>
        </div>

        <h2 className="mt-8 font-lexend text-xl font-bold">Breakdown by category</h2>
        {breakdown.length === 0 ? (
          <p className="mt-3 text-sm text-white/60">
            No risky categories detected — nothing to clean up.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {breakdown.map((row) => (
              <li key={row.category} className="card-border rounded-card bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{RISK_CATEGORY_LABELS[row.category]}</span>
                  <span className="text-sm text-white/60">
                    {row.count} item{row.count === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: Math.round((row.count / maxCount) * 100) + "%" }}
                  />
                </div>
                <p className="mt-2 text-xs text-white/50">
                  <span style={{ color: RISK_LEVEL_COLORS.high }}>{row.high} high</span> ·{" "}
                  <span style={{ color: RISK_LEVEL_COLORS.medium }}>{row.medium} medium</span>
                </p>
              </li>
            ))}
          </ul>
        )}

        <h2 className="mt-8 font-lexend text-xl font-bold">Download your report</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void download(false)}
            disabled={busy !== null}
            className="inline-flex min-h-[48px] items-center justify-center rounded-card bg-primary px-6 py-3 font-semibold text-white transition hover:bg-accent disabled:opacity-40"
          >
            {busy === "full" ? "Generating…" : "Download full report"}
          </button>
          <button
            type="button"
            onClick={() => void download(true)}
            disabled={busy !== null}
            className="inline-flex min-h-[48px] items-center justify-center rounded-card border border-white/20 bg-background px-6 py-3 font-semibold text-white/80 transition hover:bg-white/5 disabled:opacity-40"
          >
            {busy === "redacted" ? "Generating…" : "Employer redacted report"}
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        )}

        <p className="mt-8 text-center text-sm">
          <Link href="/review" className="font-semibold text-accent transition hover:text-primary">
            ← Back to review feed
          </Link>
        </p>
      </div>
    </RequireAuth>
  );
}
