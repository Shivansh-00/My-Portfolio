import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          500: "#6366f1",
          700: "#4338ca"
        },
        neon: {
          cyan: "#00f0ff",
          magenta: "#ff00e5",
          green: "#39ff14",
          orange: "#ff6a00",
          yellow: "#ffe600",
          red: "#ff073a",
          blue: "#0080ff",
          purple: "#a855f7"
        },
        gaming: {
          dark: "#0a0a0f",
          panel: "#111118",
          card: "#16161f",
          border: "#2a2a3a",
          surface: "#1e1e2e"
        }
      },
      fontFamily: {
        gaming: ['"Orbitron"', "sans-serif"],
        body: ['"Rajdhani"', "sans-serif"],
        mono: ['"Share Tech Mono"', "monospace"]
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "scan-line": "scan-line 4s linear infinite",
        "flicker": "flicker 3s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "cyber-glitch": "cyber-glitch 0.3s ease-in-out",
        "slide-up": "slide-up 0.6s ease-out",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "progress-fill": "progress-fill 1.5s ease-out",
        "border-glow": "border-glow 3s ease-in-out infinite",
        "typing": "typing 3s steps(30) infinite",
        "particle-float": "particle-float 8s ease-in-out infinite"
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(0,240,255,0.3), 0 0 20px rgba(0,240,255,0.1)" },
          "50%": { boxShadow: "0 0 20px rgba(0,240,255,0.6), 0 0 60px rgba(0,240,255,0.3)" }
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" }
        },
        "flicker": {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": { opacity: "1" },
          "20%, 24%, 55%": { opacity: "0.4" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" }
        },
        "cyber-glitch": {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" }
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        "progress-fill": {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width)" }
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(0,240,255,0.3)" },
          "50%": { borderColor: "rgba(0,240,255,0.8)" }
        },
        "typing": {
          "0%": { width: "0" },
          "50%": { width: "100%" },
          "100%": { width: "0" }
        },
        "particle-float": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(10px, -10px)" },
          "50%": { transform: "translate(-5px, -20px)" },
          "75%": { transform: "translate(-10px, -5px)" }
        }
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)",
        "cyber-gradient": "linear-gradient(135deg, #0a0a0f 0%, #111128 50%, #0a0a0f 100%)"
      }
    }
  },
  plugins: []
};

export default config;
