import JSZip, { type JSZipObject } from "jszip";
import type { ScanInputItem } from "./riskScan";

/**
 * Client-side archive parser for social media data exports.
 *
 * Runs entirely in the browser — the raw archive never leaves the user's
 * machine. Supports:
 *   • ZIP  — the format every major platform ships (Facebook, Instagram,
 *            Twitter/X, LinkedIn, TikTok)
 *   • JSON — single-file exports and hand-rolled lists
 *   • CSV  — Twitter/X and LinkedIn post exports
 *
 * Real platform archives are deeply nested and inconsistent, so this walks the
 * whole JSON tree and harvests any object that looks like a post.
 */

export const ACCEPTED_EXTENSIONS = ["zip", "json", "csv"];
export const ACCEPT_ATTR = ".zip,.json,.csv,application/zip,application/json,text/csv";

/** Keep the AI request bounded. Extra items still count toward the totals. */
export const MAX_ITEMS_SCANNED = 300;

const TEXT_KEYS = [
  "full_text",
  "text",
  "content",
  "message",
  "commentary",
  "description",
  "caption",
  "title",
  "post",
  "status",
  "body",
  "note",
  "text_post"
];

const DATE_KEYS = [
  "created_at",
  "created_time",
  "creation_timestamp",
  "date",
  "timestamp",
  "datetime",
  "time",
  "published_at",
  "post_date",
  "upload_time"
];

const PLATFORM_PATTERNS: { platform: string; re: RegExp }[] = [
  { platform: "facebook", re: /facebook|fb[_-]?data|your_posts/i },
  { platform: "instagram", re: /instagram|\big_/i },
  { platform: "twitter", re: /twitter|\btweets?\b|\bx_data\b|replies\.json/i },
  { platform: "linkedin", re: /linkedin|connections\.csv|shares\.csv/i },
  { platform: "tiktok", re: /tiktok/i }
];

function detectPlatform(hints: string[]): string {
  const hay = hints.join(" ");
  for (const { platform, re } of PLATFORM_PATTERNS) {
    if (re.test(hay)) return platform;
  }
  return "unknown";
}

function firstString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function normaliseDate(raw: string | null): string {
  if (!raw) return "";
  // Twitter/X archives use epoch seconds; most others use ISO strings.
  if (/^\d{9,13}$/.test(raw)) {
    const ms = raw.length > 10 ? Number(raw) : Number(raw) * 1000;
    const d = new Date(ms);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d.toISOString();
  return raw;
}

/** Flattens a string / array / object field into readable text. */
function flattenText(value: unknown, depth = 0): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map((v) => flattenText(v, depth + 1)).filter(Boolean).join(" ");
  }
  if (depth < 3 && value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map((v) => flattenText(v, depth + 1))
      .filter(Boolean)
      .join(" ");
  }
  return "";
}

function extractText(obj: Record<string, unknown>): string {
  for (const key of TEXT_KEYS) {
    if (!(key in obj)) continue;
    const text = flattenText(obj[key]).trim();
    if (text) return text;
  }
  return "";
}

/**
 * Walks an arbitrary parsed-JSON structure and collects post-like objects.
 * `hints` carries filename/platform context down the tree.
 */
function harvest(value: unknown, hints: string[], out: ScanInputItem[], seen: Set<object>) {
  if (out.length >= MAX_ITEMS_SCANNED * 2) return;

  if (Array.isArray(value)) {
    for (const entry of value) harvest(entry, hints, out, seen);
    return;
  }

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (seen.has(obj)) return;
    seen.add(obj);

    const nested: string[] = [...hints];
    // Keys that name a platform/subfolder become platform hints for children.
    for (const key of Object.keys(obj)) {
      if (PLATFORM_PATTERNS.some((p) => p.re.test(key))) nested.push(key);
    }

    const text = extractText(obj);
    if (text.length >= 3) {
      const date = normaliseDate(firstString(obj, DATE_KEYS));
      out.push({
        id: `item-${out.length + 1}`,
        text: text.slice(0, 4000),
        platform: detectPlatform([...hints, ...nested, ...Object.keys(obj)]),
        date
      });
    }

    for (const child of Object.values(obj)) {
      if (child && typeof child === "object") harvest(child, nested, out, seen);
    }
  }
}

/** Minimal RFC-4180 CSV parser (handles quoted fields and embedded commas). */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const clean = rows.filter((r) => r.some((c) => c.trim()));
  if (clean.length < 2) return [];
  const header = clean[0].map((h) => h.trim());
  return clean.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((h, i) => {
      obj[h] = r[i] ?? "";
    });
    return obj;
  });
}

export interface ParsedArchive {
  items: ScanInputItem[];
  /** Every unique post-like object found, before the scan cap was applied. */
  totalFound: number;
  fileNames: string[];
}

/** Parses one already-extracted JSON string (used for both files and ZIP entries). */
export function parseJsonText(text: string, fileName: string): ScanInputItem[] {
  const out: ScanInputItem[] = [];
  try {
    const data: unknown = JSON.parse(text);
    harvest(data, [fileName], out, new Set());
  } catch {
    return [];
  }
  return out;
}

/** Turns CSV rows into items, detecting platform from headers + filename. */
function rowsToItems(
  rows: Record<string, string>[],
  source: string
): ScanInputItem[] {
  const items: ScanInputItem[] = [];
  for (const row of rows) {
    const text = extractText(row);
    if (text.length < 3) continue;
    items.push({
      id: `item-${items.length + 1}`,
      text: text.slice(0, 4000),
      platform: detectPlatform([source, ...Object.keys(row)]),
      date: normaliseDate(firstString(row, DATE_KEYS))
    });
  }
  return items;
}

/** Parses an uploaded archive file into scannable items. Runs in the browser. */
export async function parseArchive(file: File): Promise<ParsedArchive> {
  const name = file.name.toLowerCase();
  let items: ScanInputItem[] = [];
  const fileNames: string[] = [file.name];

  if (name.endsWith(".csv")) {
    items = rowsToItems(parseCsv(await file.text()), file.name);
  } else if (name.endsWith(".json")) {
    items = parseJsonText(await file.text(), file.name);
  } else if (name.endsWith(".zip")) {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const entries = Object.values(zip.files).filter(
      (f) => !f.dir && /\.(json|csv)$/i.test(f.name)
    );

    for (const entry of entries as JSZipObject[]) {
      if (items.length >= MAX_ITEMS_SCANNED) break;
      fileNames.push(entry.name);
      let text: string;
      try {
        text = await entry.async("string");
      } catch {
        // Skip entries we cannot decode (encrypted or binary mislabelled).
        continue;
      }
      // Skip the giant ad/media blobs that dominate most archives.
      if (text.length > 8_000_000) continue;
      const parsed = /\.csv$/i.test(entry.name)
        ? rowsToItems(parseCsv(text), entry.name)
        : parseJsonText(text, entry.name);
      for (const item of parsed) {
        items.push({ ...item, id: `item-${items.length + 1}` });
      }
    }
  } else {
    throw new Error("Unsupported file type. Upload a .zip, .json or .csv archive.");
  }

  // Drop empties and de-duplicate identical text (archives repeat content a lot).
  const seen = new Set<string>();
  const unique = items.filter((item) => {
    const key = item.text.slice(0, 200).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (unique.length === 0) {
    throw new Error(
      "No posts or messages found in that archive. Make sure you upload your platform's data export (ZIP), not the settings download."
    );
  }

  return {
    items: unique.slice(0, MAX_ITEMS_SCANNED),
    totalFound: unique.length,
    fileNames
  };
}
