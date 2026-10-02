"use client";

import { motion } from "framer-motion";
import AuditRow from "./AuditRow";
import type { Audit } from "@/types/models";

interface Props {
  audits: Audit[];
  loadingMore?: boolean;
}

export default function AuditList({ audits, loadingMore }: Props) {
  return (
    <section aria-label="Past audits" className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-lexend text-xl font-bold">Past audits</h2>
        <span className="text-sm text-white/60">{audits.length} total</span>
      </div>
      <motion.ul layout className="flex flex-col gap-4">
        {audits.map((a, i) => (
          <AuditRow key={a.audit_id} audit={a} index={i} />
        ))}
      </motion.ul>
      {loadingMore && (
        <p className="mt-4 text-center text-sm text-white/60" role="status">
          Loading more audits…
        </p>
      )}
    </section>
  );
}
