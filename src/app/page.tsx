import Link from "next/link";

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

      {/* Upload zone (visual placeholder — drag-drop wiring comes next) */}
      <div className="card-border mx-auto mt-8 max-w-2xl rounded-modal bg-surface p-6 sm:p-8">
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload your social media archive"
          className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-white/20 bg-background p-8 text-center transition hover:border-primary/60 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <p className="text-4xl" aria-hidden="true">
            📤
          </p>
          <p className="font-semibold">Drag &amp; drop your archive here</p>
          <p className="text-sm text-white/60">JSON, CSV or ZIP · max 2GB per upload</p>
          <span className="mt-2 inline-flex min-h-[48px] items-center justify-center rounded-card bg-primary px-6 py-3 font-semibold text-white transition duration-200 hover:scale-[1.02] hover:bg-accent active:scale-[0.98]">
            Choose file
          </span>
        </div>

        {/* Supported platforms */}
        <div className="mt-6">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-white/50">
            Supported platforms
          </p>
          <ul className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {["Facebook", "Instagram", "Twitter/X", "LinkedIn", "TikTok"].map((p) => (
              <li
                key={p}
                className="rounded-badge border border-white/10 bg-background px-3 py-2 text-sm text-white/80"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-sm">
          <Link href="/dashboard" className="font-semibold text-accent transition hover:text-primary">
            View demo dashboard →
          </Link>
        </p>
      </div>

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
    </div>
  );
}
