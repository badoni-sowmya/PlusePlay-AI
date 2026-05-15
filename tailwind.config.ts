import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        pitch: "#07110d",
        turf: "#0f8f58",
        flare: "#ff8b3d",
        signal: "#22d3ee",
        pulse: "#f43f5e",
        ink: "#d8fff0"
      },
      boxShadow: {
        glow: "0 0 34px rgba(34, 211, 238, 0.25)",
        live: "0 0 28px rgba(244, 63, 94, 0.35)"
      },
      backgroundImage: {
        "field-grid":
          "linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px)",
        "radar-sweep":
          "conic-gradient(from 180deg at 50% 50%, rgba(34,211,238,.16), transparent 25%, rgba(255,139,61,.14), transparent 55%, rgba(15,143,88,.18))"
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        pulseLive: "pulseLive 1.35s ease-in-out infinite",
        float: "float 5s ease-in-out infinite"
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-220% 0" },
          "100%": { backgroundPosition: "220% 0" }
        },
        pulseLive: {
          "0%, 100%": { opacity: "0.45", transform: "scale(0.96)" },
          "50%": { opacity: "1", transform: "scale(1.08)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
