import Link from "next/link";

export const metadata = {
  title: "Scan Progress"
};

export default function ScanPage() {
  const steps = [
    "Upload validated",
    "Parsing content",
    "Analyzing risk categories",
    "Generating score"
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
      <h1 className="font-lexend text-3xl font-bold tracking-tight sm:text-4xl">
        Scanning your content
      </h1>
      <p className="mt-2 max-w-xl text-sm text-white/60 sm:text-base">
        Live scan progress will appear here once file upload is wired to Firebase.
      </p>

      <div className="card-border mx-auto mt-8 max-w-2xl rounded-modal bg-surface p-6 sm:p-8">
        <div
          className="h-3 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Scan progress"
        >
          <div className="h-full w-0 rounded-full bg-primary" />
        </div>
        <p className="mt-3 text-center text-sm text-white/60">
          Waiting for an upload… (0% complete)
        </p>

        <ol className="mt-6 flex flex-col gap-3">
          {steps.map((s) => (
            <li
              key={s}
              className="flex items-center gap-3 rounded-card border border-white/10 bg-background px-4 py-3 text-sm text-white/60"
            >
              <span
                aria-hidden="true"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-xs"
              >
                ○
              </span>
              {s}
            </li>
          ))}
        </ol>

        <p className="mt-6 text-center text-sm">
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
