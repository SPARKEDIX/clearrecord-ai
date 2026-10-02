import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1DB954",
        secondary: "#191414",
        accent: "#1ED760",
        background: "#121212",
        surface: "#181818",
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
