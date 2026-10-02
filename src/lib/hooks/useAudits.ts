"use client";

import { useEffect, useState } from "react";
import type { Audit } from "@/types/models";
import { MOCK_AUDITS } from "@/lib/mock/dashboardMock";

export type PreviewMode = "data" | "empty" | "error";

export type AuditsResult =
  | { status: "loading"; audits: Audit[]; retry: () => void }
  | { status: "error"; message: string; audits: Audit[]; retry: () => void }
  | { status: "success"; audits: Audit[]; retry: () => void };

/**
 * Dashboard audit-history hook.
 * Today: simulated fetch against local mock data (no backend yet).
 * Tomorrow: swap the setTimeout body for a Firestore query on `audits`
 * where user_id == current user, ordered by upload_date desc.
 */
export function useAudits(mode: PreviewMode = "data"): AuditsResult {
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [audits, setAudits] = useState<Audit[]>([]);
  const [message, setMessage] = useState("Failed to load audit history.");

  useEffect(() => {
    setStatus("loading");
    setAudits([]);
    const t = setTimeout(() => {
      if (mode === "error") {
        setMessage("Failed to load audit history.");
        setStatus("error");
      } else if (mode === "empty") {
        setAudits([]);
        setStatus("success");
      } else {
        setAudits(MOCK_AUDITS);
        setStatus("success");
      }
    }, 900);
    return () => clearTimeout(t);
  }, [mode]);

  const retry = () => {
    setStatus("loading");
    setAudits([]);
  };

  if (status === "loading") return { status, audits, retry };
  if (status === "error") return { status, message, audits, retry };
  return { status, audits, retry };
}
