"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Audit } from "@/types/models";
import { formatDate } from "@/lib/utils/dashboard";
import { scoreColor } from "@/lib/constants/risks";

interface Props {
  audit: Audit;
  index: number;
}

function statusBadge(status: Audit["scan_status"]) {
  const map = {
    completed: "bg-primary/20 text-accent",
    processing: "bg-warning/20 text-warning",
    pending: "bg-white/10 text-white/70",
    failed: "bg-danger/20 text-danger"
  } as const;
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`rounded-badge px-2 py-1 text-xs font-semibold ${map[status]}`}>{label}</span>
  );
}

export default function AuditRow({ audit, index }: Props) {
  const score = audit.digital_hygiene_score;

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
      className="card-border flex flex-col gap-4 rounded-card bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card font-lexend text-xl font-bold"
          style={{
            backgroundColor: `${scoreColor(score ?? 0)}22`,
            color: scoreColor(score ?? 0),
            border: `1px solid ${scoreColor(score ?? 0)}55`
          }}
          aria-label={`Score ${score ?? "—"} out of 100`}
        >
          {score ?? "—"}
        </div>
        <div>
          <p className="font-semibold">{formatDate(audit.upload_date)}</p>
          <p className="mt-1 text-sm text-white/60">
            {audit.total_flagged_items ?? 0} flagged ·{" "}
            {audit.total_items_scanned?.toLocaleString("en-IN") ?? 0} scanned
          </p>
          <div className="mt-2">{statusBadge(audit.scan_status)}</div>
        </div>
      </div>

      <Link
        href="/score"
        className="inline-flex min-h-[48px] items-center justify-center rounded-card bg-primary px-4 py-3 text-sm font-semibold text-white transition duration-200 ease-out hover:scale-[1.02] hover:bg-accent active:scale-[0.98] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        View report
      </Link>
    </motion.li>
  );
}
