import type { Metadata } from "next";
import Link from "next/link";
import RequireAuth from "@/components/auth/RequireAuth";
import UploadDropzone from "@/components/upload/UploadDropzone";

export const metadata: Metadata = {
  title: "Upload archive"
};

export default function UploadPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
      {/* Hero */}
      <div className="text-center">
        <span className="inline-block rounded-badge bg-primary/20 px-3 py-1 text-xs font-semibold text-accent">
          🔒 End-to-end encrypted · Your data never leaves your control
        </span>
        <h1 className="mx-auto mt-4 max-w-2xl font-lexend text-3xl font-bold tracking-tight sm:text-5xl">
          Audit your social media <span className="text-primary">before employers do</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-white/60 sm:text-base">
          Upload your social media data archive. Our AI scans it against 13 employer
          screening risk categories and gives you a Digital Hygiene Score (0–100).
        </p>
      </div>

      <RequireAuth>
        <UploadDropzone />
      </RequireAuth>

      {/* How it works */}
      <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { step: "1", title: "Upload", text: "Drop your platform data archive" },
          { step: "2", title: "AI Scan", text: "13 risk categories checked in minutes" },
          { step: "3", title: "Clean up", text: "Review, delete & download your report" }
        ].map((s) => (
          <div key={s.step} className="card-border rounded-card bg-surface p-5 text-center">
            <p className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold">
              {s.step}
            </p>
            <p className="mt-3 font-semibold">{s.title}</p>
            <p className="mt-1 text-sm text-white/60">{s.text}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-sm">
        <Link href="/dashboard" className="font-semibold text-accent transition hover:text-primary">
          View demo dashboard →
        </Link>
      </p>
    </div>
  );
}
