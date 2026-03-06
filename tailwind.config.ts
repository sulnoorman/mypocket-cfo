import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        foreground: "#e5e7eb",
        card: "#020617",
        cardForeground: "#e5e7eb",
        muted: "#020617",
        mutedForeground: "#64748b",
        accent: "#1e293b",
        border: "#1f2937",
        input: "#020617",
        ring: "#38bdf8",
        primary: {
          DEFAULT: "#38bdf8",
          foreground: "#020617"
        },
        secondary: {
          DEFAULT: "#6366f1",
          foreground: "#e5e7eb"
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#fee2e2"
        }
      }
    }
  },
  plugins: []
}

export default config
