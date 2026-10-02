import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-secondary">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 py-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} ClearRecord AI. Your privacy, cleaned up.</p>
        <div className="flex items-center gap-4">
          <Link href="/" className="transition hover:text-white">
            Privacy policy
          </Link>
          <span aria-hidden="true" className="rounded-badge bg-primary/20 px-2 py-1 text-xs text-accent">
            🔒 Encrypted
          </span>
        </div>
      </div>
    </footer>
  );
}
