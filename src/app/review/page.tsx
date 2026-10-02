"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RISK_CATEGORY_LABELS, RISK_LEVEL_COLORS, scoreColor } from "@/lib/constants/risks";
import {
  loadScanSession,
  saveScanSession,
  scoreWithActions,
  sortByRisk,
  type ScanSession
} from "@/lib/scan/scanSession";
import type { RiskCategory, RiskLevel, UserAction } from "@/types/models";
import RequireAuth from "@/components/auth/RequireAuth";

const LEVELS: RiskLevel[] = ["high", "medium", "safe"];

const ACTIONS: { value: UserAction; label: string }[] = [
  { value: "reviewed", label: "Reviewed" },
  { value: "deleted", label: "Deleted" },
  { value: "untagged", label: "Untag" }
];

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className="rounded-badge px-2 py-1 text-xs font-bold uppercase"
      style={{ backgroundColor: RISK_LEVEL_COLORS[level] + "22", color: RISK_LEVEL_COLORS[level] }}
    >
      {level}
    </span>
  );
}

export default function ReviewPage() {
  const [session, setSession] = useState<ScanSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [levelFilter, setLevelFilter] = useState<RiskLevel | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<RiskCategory | "all">("all");

  useEffect(() => {
    setSession(loadScanSession());
    setLoaded(true);
  }, []);

  const update = (id: string, user_action: UserAction) => {
    setSession((prev) => {
      if (!prev) return prev;
      const items = prev.items.map((i) =>
        i.id === id ? { ...i, user_action: i.user_action === user_action ? "pending" : user_action } : i
      );
      const next = { ...prev, items };
      saveScanSession(next);
      return next;
    });
  };

  const categories = useMemo(() => {
    const set = new Set<RiskCategory>();
    session?.items.forEach((i) => {
      if (i.risk_level !== "safe") set.add(i.risk_category);
    });
    return [...set];
  }, [session]);

  const visible = useMemo(() => {
    if (!session) return [];
    return sortByRisk(session.items).filter(
      (i) =>
        (levelFilter === "all" || i.risk_level === levelFilter) &&
        (categoryFilter === "all" || i.risk_category === categoryFilter)
    );
  }, [session, levelFilter, categoryFilter]);

  if (!loaded) return null;

  if (!session) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
        <div className="card-border rounded-modal bg-surface px-6 py-16 text-center">
          <p className="font-lexend text-6xl font-bold text-white/30">—</p>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/60">
            No completed audit yet. Upload an archive to see flagged items here.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-card bg-primary px-6 py-3 font-semibold text-white transition hover:bg-accent"
          >
            Start an audit
          </Link>
        </div>
      </div>
    );
  }

  const liveScore = scoreWithActions(session.items, session.score);
  const counts = {
    high: session.items.filter((i) => i.risk_level === "high").length,
    medium: session.items.filter((i) => i.risk_level === "medium").length,
    safe: session.items.filter((i) => i.risk_level === "safe").length
  };

  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-lexend text-3xl font-bold tracking-tight sm:text-4xl">
              Review flagged items
            </h1>
            <p className="mt-2 text-sm text-white/60">
              {session.fileName} · {session.totalScanned} items scanned
              {session.totalFound > session.totalScanned
                ? " (showing first " + session.totalScanned + ")"
                : ""}
            </p>
          </div>
          <Link
            href="/score"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-card bg-primary px-6 py-3 font-semibold text-white transition hover:bg-accent"
          >
            View score &amp; report →
          </Link>
        </div>

        {!session.aiUsed && (
          <div role="alert" className="mt-4 rounded-card border border-warning/40 bg-warning/10 p-4 text-sm">
            <p className="text-warning">
              AI screening was unavailable, so these results come from the keyword fallback.
              {session.aiError ? " (" + session.aiError + ")" : ""}
            </p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="card-border rounded-card bg-surface p-4 text-center">
            <p className="font-lexend text-3xl font-bold" style={{ color: scoreColor(liveScore) }}>
              {liveScore}
            </p>
            <p className="mt-1 text-xs text-white/60">Live score</p>
          </div>
          {LEVELS.map((lvl) => (
            <div key={lvl} className="card-border rounded-card bg-surface p-4 text-center">
              <p className="font-lexend text-3xl font-bold" style={{ color: RISK_LEVEL_COLORS[lvl] }}>
                {counts[lvl]}
              </p>
              <p className="mt-1 text-xs uppercase text-white/60">{lvl}</p>
            </div>
          ))}
        </div>

        <div className="card-border mt-6 flex flex-col gap-3 rounded-card bg-surface p-4 sm:flex-row sm:items-center">
          <label className="text-sm font-semibold" htmlFor="level-filter">Risk level</label>
          <select
            id="level-filter"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as RiskLevel | "all")}
            className="input-base sm:max-w-[180px]"
          >
            <option value="all">All levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <label className="text-sm font-semibold" htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as RiskCategory | "all")}
            className="input-base sm:max-w-[240px]"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{RISK_CATEGORY_LABELS[c]}</option>
            ))}
          </select>

          <p className="text-sm text-white/60 sm:ml-auto">Showing {visible.length} items</p>
        </div>

        <ul className="mt-6 flex flex-col gap-3">
          {visible.map((item) => (
            <li key={item.id} className="card-border rounded-card bg-surface p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <RiskBadge level={item.risk_level} />
                <span className="rounded-badge bg-white/5 px-2 py-1 text-xs font-semibold text-white/80">
                  {RISK_CATEGORY_LABELS[item.risk_category]}
                </span>
                <span className="text-xs capitalize text-white/50">{item.platform}</span>
                {item.date && (
                  <span className="text-xs text-white/50">{new Date(item.date).toLocaleDateString()}</span>
                )}
              </div>

              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed">
                {item.text.length > 400 ? item.text.slice(0, 400) + "…" : item.text}
              </p>
              <p className="mt-2 text-xs italic text-white/50">{item.reason}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {ACTIONS.map((a) => {
                  const active = item.user_action === a.value;
                  return (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => update(item.id, a.value)}
                      aria-pressed={active}
                      className={
                        "min-h-[48px] rounded-card px-4 py-2 text-sm font-semibold transition " +
                        (active
                          ? "bg-primary text-white"
                          : "border border-white/20 bg-background text-white/70 hover:bg-white/5")
                      }
                    >
                      {a.label}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>

        {visible.length === 0 && (
          <p className="mt-10 text-center text-sm text-white/60">
            No items match these filters.
          </p>
        )}

        <p className="mt-8 text-center text-sm">
          <Link href="/dashboard" className="font-semibold text-accent transition hover:text-primary">
            ← Back to dashboard
          </Link>
        </p>
      </div>
    </RequireAuth>
  );
}
