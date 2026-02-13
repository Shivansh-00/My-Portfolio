"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_LINES = [
  "SPIDER-SENSE NETWORK v5.0.1 LOADED",
  "WEB-SHOOTER CALIBRATION .............. [OK]",
  "SPIDER-SENSE ARRAY SYNC ............. [OK]",
  "3D CITY RENDERER: THREE.JS / R3F ..... [OK]",
  "WEB-SWING PHYSICS ENGINE ............ [OK]",
  "SPATIAL AUDIO: CINEMA ENGINE v4 ..... [OK]",
  "WEB INTEGRITY CHECK ................. [OK]",
  "SCANNING CITY SKYLINE ...............",
  "ESTABLISHING WEB NETWORK ............",
  "ALL SYSTEMS ONLINE ✓",
];

export default function BootScreen() {
  const [visible, setVisible] = useState(true);
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"boot" | "ready">("boot");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("portfolio-booted")) {
        setVisible(false);
        return;
      }
    } catch {}

    const totalDuration = 2400;
    const interval = totalDuration / BOOT_LINES.length;

    BOOT_LINES.forEach((line, i) => {
      timersRef.current.push(
        setTimeout(() => {
          setLines((prev) => [...prev, line]);
          setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
        }, i * interval)
      );
    });

    timersRef.current.push(
      setTimeout(() => setPhase("ready"), totalDuration)
    );

    timersRef.current.push(
      setTimeout(() => {
        try { sessionStorage.setItem("portfolio-booted", "1"); } catch {}
        setVisible(false);
      }, totalDuration + 700)
    );

    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const skip = () => {
    timersRef.current.forEach(clearTimeout);
    try { sessionStorage.setItem("portfolio-booted", "1"); } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot-overlay"
          exit={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #050510 0%, #08080f 50%, #050510 100%)",
          }}
        >
          {/* Animated grid */}
          <div className="absolute inset-0 grid-overlay opacity-15 pointer-events-none" />

          {/* Radial pulse */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                "radial-gradient(circle at 50% 50%, rgba(220,20,60,0.03) 0%, transparent 50%)",
                "radial-gradient(circle at 50% 50%, rgba(220,20,60,0.06) 0%, transparent 60%)",
                "radial-gradient(circle at 50% 50%, rgba(220,20,60,0.03) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.8) 100%)" }}
          />

          {/* Scanlines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{
              background: "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(220,20,60,0.1) 2px, rgba(220,20,60,0.1) 4px)",
            }}
          />

          <div className="relative z-10 w-full max-w-md px-6">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.4, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 180, damping: 14 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <motion.div
                  className="w-16 h-16 border-2 border-neon-cyan/40 rotate-45 flex items-center justify-center"
                  animate={{
                    borderColor: ["rgba(220,20,60,0.3)", "rgba(220,20,60,0.9)", "rgba(220,20,60,0.3)"],
                    boxShadow: [
                      "0 0 8px rgba(220,20,60,0.2), inset 0 0 8px rgba(220,20,60,0.05)",
                      "0 0 35px rgba(220,20,60,0.6), inset 0 0 25px rgba(220,20,60,0.12)",
                      "0 0 8px rgba(220,20,60,0.2), inset 0 0 8px rgba(220,20,60,0.05)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="font-gaming text-lg neon-text-cyan -rotate-45 select-none">SS</span>
                </motion.div>
                {/* Rotating rings */}
                <motion.div
                  className="absolute inset-[-12px] border border-neon-cyan/10 rotate-45 rounded-sm"
                  animate={{ rotate: [45, 405] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-[-20px] border border-neon-magenta/8 rotate-45 rounded-sm"
                  animate={{ rotate: [45, -315] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-[-28px] border border-neon-cyan/4 rotate-45 rounded-sm"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center font-gaming text-[10px] tracking-[0.5em] text-slate-600 mb-8"
            >
              WEB-SLINGER SYSTEMS
            </motion.p>

            {/* Terminal window */}
            <div className="bg-[#060610] border border-gaming-border rounded-md overflow-hidden mb-6 shadow-2xl shadow-black/50">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gaming-border bg-gaming-dark/60">
                <span className="w-2 h-2 rounded-full bg-neon-red/80" />
                <span className="w-2 h-2 rounded-full bg-neon-yellow/80" />
                <span className="w-2 h-2 rounded-full bg-neon-green/80" />
                <span className="font-mono text-[9px] text-slate-600 ml-2">spider_init.exe</span>
              </div>

              <div className="p-4 min-h-[200px] max-h-[240px] overflow-hidden font-mono text-[11px] space-y-0.5">
                {lines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10, filter: "blur(2px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.15 }}
                    className={`leading-[22px] ${
                      line.includes("[OK]")
                        ? "text-neon-green/80"
                        : line.includes("✓")
                          ? "text-neon-cyan font-bold"
                          : "text-slate-500"
                    }`}
                  >
                    <span className="text-neon-cyan/40 mr-1.5">›</span>
                    {line}
                  </motion.div>
                ))}
                {phase !== "ready" && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-neon-cyan inline-block mt-1"
                  >
                    ▐
                  </motion.span>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] text-slate-600 tracking-wider">
                  {phase === "ready" ? "READY" : "INITIALIZING"}
                </span>
                <span className="font-mono text-[9px] neon-text-cyan">{progress}%</span>
              </div>
              <div className="h-[3px] bg-gaming-dark border border-gaming-border/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{
                    background: "linear-gradient(90deg, #DC143C, #a855f7, #1E90FF)",
                    boxShadow: "0 0 8px rgba(220,20,60,0.5), 0 0 20px rgba(220,20,60,0.2)",
                  }}
                />
              </div>
            </div>

            {/* Skip */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={skip}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 block mx-auto font-mono text-[9px] text-slate-700 hover:text-neon-cyan/60
                         transition-colors tracking-wider border border-transparent hover:border-neon-cyan/20 px-3 py-1.5"
            >
              SKIP BOOT SEQUENCE ››
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
