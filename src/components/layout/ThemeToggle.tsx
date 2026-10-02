"use client";

import { useTheme } from "@/lib/theme/ThemeContext";

function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const showingDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={showingDark ? "Switch to light mode" : "Switch to dark mode"}
      title={showingDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-card border border-white/10 bg-surface px-3 py-2 text-white transition hover:scale-[1.02] hover:border-primary/60 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent active:scale-[0.98]"
    >
      {showingDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
