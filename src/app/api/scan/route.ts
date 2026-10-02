import { NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase/admin";
import { classifyChunk, isAiConfigured, readAiConfig } from "@/lib/scan/aiClient";
import {
  AI_CHUNK_SIZE,
  AI_MAX_ITEMS,
  chunk,
  heuristicScan,
  scoreFromLevels,
  isRiskCategory,
  isRiskLevel,
  type ScanInputItem,
  type ScanResultItem
} from "@/lib/scan/riskScan";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Server-side guard so the AI key is never reachable by anonymous callers. */
async function requireUser(request: Request): Promise<string | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  try {
    const decoded = await verifyIdToken(token);
    return decoded?.uid ?? null;
  } catch {
    return null;
  }
}

function isScanInputItem(value: unknown): value is ScanInputItem {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.text === "string" && o.text.trim().length > 0;
}

export async function POST(request: Request) {
  const uid = await requireUser(request);
  if (!uid) {
    return NextResponse.json(
      { error: "You must be logged in to run a scan." },
      { status: 401 }
    );
  }

  let body: { items?: unknown };
  try {
    body = (await request.json()) as { items?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawItems = Array.isArray(body.items) ? body.items.filter(isScanInputItem) : [];
  if (rawItems.length === 0) {
    return NextResponse.json(
      { error: "No content to scan. Upload an archive first." },
      { status: 400 }
    );
  }

  const items: ScanInputItem[] = rawItems.slice(0, 400).map((item, i) => ({
    id: item.id || `item-${i + 1}`,
    text: item.text.slice(0, 4000),
    platform: typeof item.platform === "string" ? item.platform.slice(0, 40) : "unknown",
    date: typeof item.date === "string" ? item.date.slice(0, 40) : ""
  }));

  // Baseline from the keyword heuristic — also the fallback if the AI is down.
  const baseline = heuristicScan(items);
  const aiResults = new Map<string, ScanResultItem>(
    baseline.items.map((r) => [r.id, r])
  );

  let aiUsed = false;
  let aiError: string | null = null;

  if (isAiConfigured()) {
    try {
      const config = readAiConfig();
      const aiItems = items.slice(0, AI_MAX_ITEMS);
      const batches = chunk(aiItems, AI_CHUNK_SIZE);

      // Sequential on purpose: free-tier providers rate-limit hard on parallel calls.
      for (const batch of batches) {
        const classified = await classifyChunk(batch, config);
        for (const result of classified) {
          aiResults.set(result.id, result);
        }
      }
      aiUsed = true;
    } catch (err) {
      // Never fail the whole audit because the provider hiccuped.
      aiError = err instanceof Error ? err.message : "AI provider unavailable.";
    }
  } else {
    aiError = "AI env vars are not configured on the server.";
  }

  const merged: ScanResultItem[] = items.map(
    (input) => aiResults.get(input.id) ?? baseline.items.find((b) => b.id === input.id)!
  );

  // Defensive: guarantee every row is a valid category/level before it is stored.
  const safe: ScanResultItem[] = merged.map((m) =>
    isRiskCategory(m.risk_category) && isRiskLevel(m.risk_level)
      ? m
      : {
          id: m.id,
          risk_category: "unprofessional_behavior",
          risk_level: "safe",
          reason: "Could not be classified automatically."
        }
  );

  return NextResponse.json({
    items: safe,
    score: scoreFromLevels(safe.map((s) => s.risk_level)),
    totalScanned: items.length,
    aiUsed,
    aiError
  });
}