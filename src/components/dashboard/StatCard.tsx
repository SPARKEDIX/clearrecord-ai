"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
  label: string;
  value: string;
  hint: string;
}

export default function StatCard({ label, value, hint }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="card-border rounded-card bg-surface p-6"
    >
      <p className="text-sm text-white/60">{label}</p>
      <p className="mt-2 font-lexend text-4xl font-bold text-white">{value}</p>
      <p className="mt-2 text-xs text-white/50">{hint}</p>
      <Link
        href="/score"
        className="mt-4 inline-block text-sm font-semibold text-accent transition hover:text-primary"
      >
        View breakdown →
      </Link>
    </motion.div>
  );
}
