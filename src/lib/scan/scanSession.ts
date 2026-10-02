"use client";

import type { RiskCategory, RiskLevel, UserAction } from "@/types/models";

/**
 * Client-side store for the most recent scan.
 *
 * Held in sessionStorage (not localStorage) so a refresh mid-review keeps
 * state, but closing the tab clears the user's content. Firestore persistence
 * is the next step — this keeps the whole upload → scan → review → report
 * flow working end to end today.
 */

export interface ReviewItem {
  id: string;
  text: string;
  platform: string;
  date: string;
  risk_category: RiskCategory;
  risk_level: RiskLevel;
  reason: string;
  user_action: UserAction;
}

export interface ScanSession {
  auditId: string;
  fileName: string;
  createdAt: string;
  totalScanned: number;
  totalFound: number;
  score: number;
  aiUsed: boolean;
  aiError: string | null;
  items: ReviewItem[];
}

const STORAGE_KEY = "clearrecord-scan-session";

export function saveScanSession(session: ScanSession): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Private-mode / quota errors are non-fatal: the flow still works in-memory.
  }
}

export function loadScanSession(): ScanSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ScanSession;
    return Array.isArray(parsed.items) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearScanSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

/** High → medium → safe, then newest first inside each level. */
export const LEVEL_ORDER: Record<RiskLevel, number> = { high: 0, medium: 1, safe: 2 };

export function sortByRisk(items: ReviewItem[]): ReviewItem[] {
  return [...items].sort((a, b) => {
    const byLevel = LEVEL_ORDER[a.risk_level] - LEVEL_ORDER[b.risk_level];
    if (byLevel !== 0) return byLevel;
    return (b.date || "").localeCompare(a.date || "");
  });
}

/**
 * Recomputes the Digital Hygiene Score after user actions.
 * Marking an item reviewed or deleted removes its penalty; the score can never
 * go below the value produced by the untouched scan.
 */
export function scoreWithActions(
  items: ReviewItem[],
  baseScore: number
): number {
  const active = items.filter(
    (i) => i.risk_level !== "safe" && i.user_action === "pending"
  );
  const penalty: Record<RiskLevel, number> = { high: 8, medium: 3, safe: 0 };
  const total = active.reduce((acc, i) => acc + penalty[i.risk_level], 0);
  return Math.max(baseScore, Math.min(100, Math.round(100 - total * 0.85)));
}

export function categoryBreakdown(items: ReviewItem[]): {
  category: RiskCategory;
  count: number;
  high: number;
  medium: number;
}[] {
  const map = new Map<RiskCategory, { count: number; high: number; medium: number }>();
  for (const item of items) {
    if (item.risk_level === "safe") continue;
    const entry = map.get(item.risk_category) ?? { count: 0, high: 0, medium: 0 };
    entry.count += 1;
    if (item.risk_level === "high") entry.high += 1;
    if (item.risk_level === "medium") entry.medium += 1;
    map.set(item.risk_category, entry);
  }
  return [...map.entries()]
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.count - a.count);
}