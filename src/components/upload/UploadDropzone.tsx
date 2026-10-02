"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone, type FileRejection } from "react-dropzone";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { ACCEPT_ATTR, parseArchive } from "@/lib/scan/parseArchive";
import { saveScanSession, type ReviewItem } from "@/lib/scan/scanSession";
import type { ScanResultItem } from "@/lib/scan/riskScan";

const MAX_FILE_BYTES = 200 * 1024 * 1024;

type Phase = "idle" | "parsing" | "scanning" | "error";

interface ScanApiResponse {
  items: ScanResultItem[];
  score: number;
  totalScanned: number;
  aiUsed: boolean;
  aiError: string | null;
  error?: string;
}

/**
 * Upload -> parse -> AI scan. Parsing happens entirely in the browser (the raw
 * archive never leaves the device); only the extracted post text is sent to
 * /api/scan, which is the only place the AI key lives.
 */
export default function UploadDropzone() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Choose a file to begin.");
  const [error, setError] = useState<string | null>(null);

  const busy = phase === "parsing" || phase === "scanning";

  const runScan = useCallback(
    async (file: File) => {
      setError(null);
      setFileName(file.name);

      try {
        setPhase("parsing");
        setProgress(15);
        setStatus("Reading your archive locally...");
        const parsed = await parseArchive(file);

        const currentUser = getFirebaseAuth().currentUser;
        if (!currentUser) {
          throw new Error("Your session expired. Please log in again.");
        }
        const token = await currentUser.getIdToken();

        setPhase("scanning");
        setProgress(45);
        setStatus(
          "AI is screening " + parsed.items.length + " items against 13 risk categories..."
        );

        const res = await fetch("/api/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify({ items: parsed.items })
        });

        const data = (await res.json()) as ScanApiResponse;

        if (!res.ok) {
          throw new Error(data.error || "Scan failed (" + res.status + ").");
        }

        setProgress(80);
        setStatus("Calculating your Digital Hygiene Score...");

        const byId = new Map(parsed.items.map((i) => [i.id, i]));
        const reviewItems: ReviewItem[] = data.items.map((result) => {
          const source = byId.get(result.id);
          return {
            id: result.id,
            text: source?.text ?? "",
            platform: source?.platform ?? "unknown",
            date: source?.date ?? "",
            risk_category: result.risk_category,
            risk_level: result.risk_level,
            reason: result.reason,
            user_action: "pending"
          };
        });

        saveScanSession({
          auditId: "audit-" + Date.now(),
          fileName: file.name,
          createdAt: new Date().toISOString(),
          totalScanned: data.totalScanned,
          totalFound: parsed.totalFound,
          score: data.score,
          aiUsed: data.aiUsed,
          aiError: data.aiError,
          items: reviewItems
        });

        setProgress(100);
        setStatus("Scan complete. Opening your results...");
        router.push("/review");
      } catch (err) {
        setPhase("error");
        setProgress(0);
        setStatus("Something went wrong.");
        setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      }
    },
    [router]
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (file) void runScan(file);
    },
    [runScan]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/zip": [".zip"],
      "application/json": [".json"],
      "text/csv": [".csv"]
    },
    multiple: false,
    maxSize: MAX_FILE_BYTES,
    disabled: busy,
    onDropRejected: (rejections: FileRejection[]) => {
      const first = rejections[0]?.errors?.[0];
      setPhase("error");
      setError(
        first?.code === "file-too-large"
          ? "That file is larger than the 200MB demo limit."
          : "Please upload a .zip, .json or .csv archive."
      );
    }
  });

  const retry = () => {
    setPhase("idle");
    setError(null);
    setProgress(0);
    setFileName("");
    setStatus("Choose a file to begin.");
  };

  return (
    <div className="card-border mx-auto mt-8 max-w-2xl rounded-modal bg-surface p-6 sm:p-8">
      <div
        {...getRootProps()}
        role="button"
        tabIndex={0}
        aria-label="Upload your social media archive"
        aria-busy={busy}
        className={
          "flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed p-8 text-center transition focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent " +
          (isDragActive
            ? "border-primary bg-primary/10"
            : "border-white/20 bg-background hover:border-primary/60") +
          (busy ? " pointer-events-none opacity-70" : "")
        }
      >
        <input {...getInputProps()} accept={ACCEPT_ATTR} />

        <p className="text-4xl" aria-hidden="true">
          {busy ? "⏳" : "📤"}
        </p>
        <p className="font-semibold">
          {isDragActive
            ? "Drop it here"
            : busy
              ? "Scanning in progress…"
              : "Drag & drop your archive here"}
        </p>
        <p className="text-sm text-white/60">JSON, CSV or ZIP · max 200MB per upload</p>
        {!busy && (
          <span className="mt-2 inline-flex min-h-[48px] items-center justify-center rounded-card bg-primary px-6 py-3 font-semibold text-white transition duration-200 hover:scale-[1.02] hover:bg-accent active:scale-[0.98]">
            Choose file
          </span>
        )}
      </div>

      {(busy || phase === "error") && (
        <div className="mt-6">
          <div
            className="h-3 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Scan progress"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
              style={{ width: progress + "%" }}
            />
          </div>
          <p className="mt-3 text-center text-sm text-white/70">
            {fileName && <span className="font-semibold text-white/90">{fileName} · </span>}
            {status} ({Math.round(progress)}%)
          </p>
          {error && (
            <div
              role="alert"
              className="mt-4 rounded-card border border-danger/40 bg-danger/10 p-4 text-sm"
            >
              <p className="text-danger">{error}</p>
              <button
                type="button"
                onClick={retry}
                className="mt-3 inline-flex min-h-[48px] items-center justify-center rounded-card border border-white/20 bg-background px-5 py-2 font-semibold transition hover:bg-white/5"
              >
                Try another file
              </button>
            </div>
          )}
        </div>
      )}

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
    </div>
  );
}

