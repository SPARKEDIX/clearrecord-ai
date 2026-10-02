import type { Config } from "tailwindcss";

// CSS-variable backed colors so the light/dark toggle works without
// rewriting every component. Opacity modifiers (e.g. `text-white/60`)
// keep working via Tailwind's <alpha-value> placeholder.
const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1DB954",
        secondary: "#191414",
        accent: "#1ED760",
        background: withAlpha("--color-background"),
        surface: withAlpha("--color-surface"),
        white: withAlpha("--color-ink"),
        danger: "#FF4444",
        warning: "#FFC107"
      },
      fontFamily: {
        lexend: ["var(--font-lexend)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        card: "8px",
        modal: "12px",
        badge: "4px"
      }
    }
  },
  plugins: []
};

export default config;

