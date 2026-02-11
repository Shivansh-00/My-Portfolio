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
        "particle-float": "particle-float 8s ease-in-out infinite",
        "rotate-slow": "rotate-slow 12s linear infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "neon-breathe": "neon-breathe 4s ease-in-out infinite",
        "bounce-in": "bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "scale-up": "scale-up 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
        "shake": "shake 0.4s ease-in-out",
        "electric-surge": "electric-surge 0.8s ease-out",
        "hue-rotate": "hue-rotate 6s linear infinite"
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
        },
        "rotate-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "neon-breathe": {
          "0%, 100%": { textShadow: "0 0 5px rgba(0,240,255,0.3), 0 0 10px rgba(0,240,255,0.2)" },
          "50%": { textShadow: "0 0 20px rgba(0,240,255,0.8), 0 0 40px rgba(0,240,255,0.4), 0 0 80px rgba(0,240,255,0.2)" }
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.1)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "scale-up": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%": { transform: "translateX(-4px)" },
          "30%": { transform: "translateX(4px)" },
          "50%": { transform: "translateX(-4px)" },
          "70%": { transform: "translateX(4px)" },
          "90%": { transform: "translateX(-2px)" }
        },
        "electric-surge": {
          "0%": { filter: "brightness(1)" },
          "25%": { filter: "brightness(2) saturate(1.5)" },
          "50%": { filter: "brightness(0.8)" },
          "75%": { filter: "brightness(1.5)" },
          "100%": { filter: "brightness(1)" }
        },
        "hue-rotate": {
          "0%": { filter: "hue-rotate(0deg)" },
          "100%": { filter: "hue-rotate(360deg)" }
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
