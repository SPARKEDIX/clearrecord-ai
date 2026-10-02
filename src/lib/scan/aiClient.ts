import "server-only";

import {
  buildUserPrompt,
  isRiskCategory,
  isRiskLevel,
  parseModelArray,
  SYSTEM_PROMPT,
  type ScanInputItem,
  type ScanResultItem
} from "./riskScan";

/**
 * Server-only AI client for an OpenAI-compatible chat-completions endpoint.
 * Configured entirely through env vars (see .env.example):
 *   AI_API_KEY   — provider key (never NEXT_PUBLIC_, stays on the server)
 *   AI_BASE_URL  — e.g. https://api.xkiro.com/v1
 *   AI_MODEL_ID  — e.g. qwen/qwen3.8-omni-flash:free
 *
 * `import "server-only"` guarantees the key can never be bundled into the
 * browser payload by mistake.
 */

const TIMEOUT_MS = 60_000;

export interface AiConfig {
  apiKey: string;
  baseUrl: string;
  modelId: string;
}

export function readAiConfig(): AiConfig {
  const apiKey = process.env.AI_API_KEY?.trim() ?? "";
  const baseUrl = (process.env.AI_BASE_URL?.trim() ?? "").replace(/\/+$/, "");
  const modelId = process.env.AI_MODEL_ID?.trim() ?? "";

  const missing: string[] = [];
  if (!apiKey) missing.push("AI_API_KEY");
  if (!baseUrl) missing.push("AI_BASE_URL");
  if (!modelId) missing.push("AI_MODEL_ID");
  if (missing.length > 0) {
    throw new Error(`Missing AI env vars: ${missing.join(", ")}. See .env.example.`);
  }
  return { apiKey, baseUrl, modelId };
}

export function isAiConfigured(): boolean {
  return Boolean(
    process.env.AI_API_KEY?.trim() &&
      process.env.AI_BASE_URL?.trim() &&
      process.env.AI_MODEL_ID?.trim()
  );
}

/** Normalises one raw model object into a ScanResultItem, or null if unusable. */
function toResultItem(raw: unknown, fallbackId: string): ScanResultItem | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;

  const category = obj.risk_category;
  const level = obj.risk_level;
  if (!isRiskCategory(category) || !isRiskLevel(level)) return null;

  const id = typeof obj.id === "string" && obj.id ? obj.id : fallbackId;
  const reason =
    typeof obj.reason === "string" && obj.reason.trim()
      ? obj.reason.trim()
      : "Flagged by AI risk screening.";

  return { id, risk_category: category, risk_level: level, reason };
}

/**
 * Classifies one chunk of items. Returns only the results the model produced
 * correctly; the caller fills any gaps with the heuristic scan.
 */
export async function classifyChunk(
  items: ScanInputItem[],
  config: AiConfig
): Promise<ScanResultItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.modelId,
        temperature: 0,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(items) }
        ]
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`AI provider ${res.status}: ${detail.slice(0, 300)}`);
    }

    const payload = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content ?? "";
    if (!content) throw new Error("AI provider returned an empty completion.");

    const rawItems = parseModelArray(content);
    const byId = new Map<string, ScanResultItem>();
    rawItems.forEach((raw, i) => {
      const item = toResultItem(raw, items[i]?.id ?? String(i));
      if (item) byId.set(item.id, item);
    });
    return items
      .map((input) => byId.get(input.id))
      .filter((x): x is ScanResultItem => Boolean(x));
  } finally {
    clearTimeout(timer);
  }
}