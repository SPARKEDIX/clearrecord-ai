import type { Audit } from "@/types/models";

export function averageScore(audits: Audit[]): number | null {
  const done = audits.filter(
    (a) => a.scan_status === "completed" && typeof a.digital_hygiene_score === "number"
  );
  if (done.length === 0) return null;
  const sum = done.reduce((acc, a) => acc + (a.digital_hygiene_score ?? 0), 0);
  return Math.round(sum / done.length);
}

export function totalRemoved(audits: Audit[]): number {
  return audits.reduce((acc, a) => acc + (a.total_flagged_items ?? 0), 0);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}
