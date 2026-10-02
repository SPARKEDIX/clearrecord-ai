import Link from "next/link";

export const metadata = {
  title: "Score & Report"
};

export default function ScorePage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
      <h1 className="font-lexend text-3xl font-bold tracking-tight sm:text-4xl">
        Score &amp; Report
      </h1>
      <p className="mt-2 max-w-xl text-sm text-white/60 sm:text-base">
        Your final Digital Hygiene Score (0–100), category breakdown and
        downloadable PDF report will live here.
      </p>

      <div className="card-border mt-8 rounded-modal bg-surface px-6 py-16 text-center">
        <p className="font-lexend text-6xl font-bold text-white/30">—</p>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/60">
          No completed audit selected yet. Run an audit from the dashboard first,
          then come back to see your score breakdown here.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            disabled
            title="Available after your first completed audit"
            className="inline-flex min-h-[48px] cursor-not-allowed items-center justify-center rounded-card bg-primary px-6 py-3 font-semibold text-white opacity-40"
          >
            Download full report (soon)
          </button>
          <button
            type="button"
            disabled
            title="Available after your first completed audit"
            className="inline-flex min-h-[48px] cursor-not-allowed items-center justify-center rounded-card border border-white/20 bg-background px-6 py-3 font-semibold text-white/70 opacity-40"
          >
            Employer redacted report (soon)
          </button>
        </div>
        <p className="mt-6 text-sm">
          <Link
            href="/dashboard"
            className="font-semibold text-accent transition hover:text-primary"
          >
            ← Back to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
