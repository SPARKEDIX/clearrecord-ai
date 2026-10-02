import type { RiskCategory, RiskLevel } from "@/types/models";
import { RISK_CATEGORY_LABELS } from "@/lib/constants/risks";

export interface ScanInputItem {
  id: string;
  text: string;
  platform: string;
  date: string;
}

export interface ScanResultItem {
  id: string;
  risk_category: RiskCategory;
  risk_level: RiskLevel;
  reason: string;
}

export interface ScanResult {
  items: ScanResultItem[];
  score: number;
}

export const RISK_CATEGORIES = Object.keys(RISK_CATEGORY_LABELS) as RiskCategory[];

export const RISK_LEVELS: RiskLevel[] = ["high", "medium", "safe"];

/** Items per AI request. Keeps each prompt well inside provider context limits. */
export const AI_CHUNK_SIZE = 25;

/** Hard cap on items sent to the AI (remaining items use the heuristic scan). */
export const AI_MAX_ITEMS = 200;

export const SYSTEM_PROMPT = `You are ClearRecord AI, an employer-perspective social media screening assistant. Classify each post into exactly ONE of these 13 hiring-risk categories: ${RISK_CATEGORIES.join(", ")}. Then assign a risk level: "high" (likely to disqualify a candidate), "medium" (unprofessional but explainable), or "safe" (no hiring risk). Reply with ONLY a JSON array, no other text. Each element: {"id": "<post id>", "risk_category": "<one of the 13>", "risk_level": "high|medium|safe", "reason": "<one short sentence>"}.`;

/** Builds the user message for one chunk of items. */
export function buildUserPrompt(items: ScanInputItem[]): string {
  const payload = items.map((i) => ({
    id: i.id,
    platform: i.platform,
    date: i.date,
    text: i.text.slice(0, 1200)
  }));
  return `Classify these ${items.length} posts. Reply with a JSON array of exactly ${items.length} objects, one per post, in the same order.\n\n${JSON.stringify(payload)}`;
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export function scoreFromLevels(levels: RiskLevel[]): number {
  if (levels.length === 0) return 100;
  const penalty: Record<RiskLevel, number> = { high: 8, medium: 3, safe: 0 };
  const total = levels.reduce((acc, l) => acc + penalty[l], 0);
  return Math.max(0, Math.min(100, Math.round(100 - total * 0.85)));
}

export function isRiskCategory(value: unknown): value is RiskCategory {
  return typeof value === "string" && (RISK_CATEGORIES as string[]).includes(value);
}

export function isRiskLevel(value: unknown): value is RiskLevel {
  return typeof value === "string" && (RISK_LEVELS as string[]).includes(value);
}

/**
 * Extracts the JSON array from a model reply. Providers wrap output in markdown
 * fences or add prose despite instructions, so this scans for the first `[`
 * and the matching last `]`.
 */
export function parseModelArray(raw: string): unknown[] {
  const text = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return [];
  try {
    const parsed: unknown = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function fallbackClassify(text: string): { category: RiskCategory; level: RiskLevel } {
  const t = text.toLowerCase();
  const has = (...words: string[]) => words.some((w) => t.includes(w));
  if (has("kill", "murder", "shoot", "bomb", "threat", "attack you")) {
    return { category: "violent_threats", level: "high" };
  }
  if (has("hate", "slur", "inferior", "go back", "subhuman")) {
    return { category: "discriminatory_language", level: "high" };
  }
  if (has("i hate my boss", "hate my job", "boss is", "manager is", "idiot")) {
    return { category: "workplace_hostility", level: "high" };
  }
  if (has("confidential", "internal memo", "do not share", "nda")) {
    return { category: "confidential_info_sharing", level: "high" };
  }
  if (has("drunk", "weed", "cocaine", "high af", "shots", "hangover")) {
    return { category: "substance_references", level: "medium" };
  }
  if (has("damn", "shit", "fuck", "bitch", "asshole", "bastard")) {
    return { category: "profanity", level: "medium" };
  }
  if (has("lied", "fake resume", "cheated", "plagiar", "scam")) {
    return { category: "dishonest_behavior", level: "high" };
  }
  return { category: "unprofessional_behavior", level: "safe" };
}

export function heuristicScan(items: ScanInputItem[]): ScanResult {
  const scanned: ScanResultItem[] = items.map((item) => {
    const found = fallbackClassify(item.text);
    return {
      id: item.id,
      risk_category: found.category,
      risk_level: found.level,
      reason:
        found.level === "safe"
          ? "No hiring risk detected in this post."
          : "Flagged by keyword heuristics (AI unavailable)."
    };
  });
  return { items: scanned, score: scoreFromLevels(scanned.map((s) => s.risk_level)) };
}
