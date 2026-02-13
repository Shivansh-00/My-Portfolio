import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef2f2",
          500: "#dc2626",
          700: "#b91c1c"
        },
        spidey: {
          red: "#DC143C",
          "red-bright": "#FF1744",
          "red-dark": "#8B0000",
          blue: "#1E3A8A",
          "blue-bright": "#3B82F6",
          "blue-deep": "#0A1628",
          web: "#C8D6E5",
          "web-bright": "#E8EDF5",
          "web-dim": "#6B7DA0",
          white: "#F0F4FF",
          gold: "#FFD700",
          electric: "#00D4FF"
        },
        neon: {
          cyan: "#DC143C",
          magenta: "#1E90FF",
          green: "#39ff14",
          orange: "#ff6a00",
          yellow: "#FFD700",
          red: "#DC143C",
          blue: "#1E90FF",
          purple: "#a855f7"
        },
        gaming: {
          dark: "#060618",
          panel: "#0C0C24",
          card: "#111132",
          border: "#1E1E4A",
          surface: "#14142E"
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
        "hue-rotate": "hue-rotate 6s linear infinite",
        "web-swing": "web-swing 3s ease-in-out infinite",
        "spider-sense": "spider-sense 1.5s ease-in-out infinite",
        "web-pulse": "web-pulse 2s ease-in-out infinite"
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(220,20,60,0.3), 0 0 20px rgba(220,20,60,0.1)" },
          "50%": { boxShadow: "0 0 20px rgba(220,20,60,0.6), 0 0 60px rgba(220,20,60,0.3)" }
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
          "0%, 100%": { borderColor: "rgba(220,20,60,0.3)" },
          "50%": { borderColor: "rgba(220,20,60,0.8)" }
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
          "0%, 100%": { textShadow: "0 0 5px rgba(220,20,60,0.3), 0 0 10px rgba(220,20,60,0.2)" },
          "50%": { textShadow: "0 0 20px rgba(220,20,60,0.8), 0 0 40px rgba(220,20,60,0.4), 0 0 80px rgba(220,20,60,0.2)" }
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
        },
        "web-swing": {
          "0%, 100%": { transform: "rotate(-12deg) translateX(-3%)" },
          "50%": { transform: "rotate(12deg) translateX(3%)" }
        },
        "spider-sense": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(220,20,60,0.2), 0 0 15px rgba(220,20,60,0.1)" },
          "50%": { boxShadow: "0 0 30px rgba(220,20,60,0.6), 0 0 60px rgba(220,20,60,0.3), 0 0 100px rgba(220,20,60,0.15)" }
        },
        "web-pulse": {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" }
        }
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(220,20,60,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(220,20,60,0.03) 1px, transparent 1px)",
        "cyber-gradient": "linear-gradient(135deg, #060618 0%, #0C0C24 50%, #060618 100%)"
      }
    }
  },
  plugins: []
};

export default config;
