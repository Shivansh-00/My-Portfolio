"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/components/audio-provider";

function randHex(len: number) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

const SCAN_LINES = [
  "SCANNING FIREWALL NODES...",
  "DECRYPTING ACCESS LAYER...",
  "BYPASSING SECURITY GRID...",
  "INJECTING PAYLOAD...",
  "BREACH SUCCESSFUL.",
];

type Phase = "locked" | "breaching" | "unlocked";

export default function BreachGateway({ children }: { children: React.ReactNode }) {
  const { playSfx } = useAudio();
  const [phase, setPhase] = useState<Phase>("locked");
  const [scanLine, setScanLine] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hexStream, setHexStream] = useState<string[]>([]);
  const [typedText, setTypedText] = useState("");
  const [showFlash, setShowFlash] = useState(false);
  const [matrixCols, setMatrixCols] = useState<
    { chars: string[]; delay: number; speed: number; left: number }[]
  >([]);
  const breachTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setMatrixCols(
      Array.from({ length: 20 }, () => ({
        chars: Array.from({ length: 12 }, () => randHex(2)),
        delay: Math.random() * 2,
        speed: 1.5 + Math.random() * 2,
        left: Math.random() * 100,
      }))
    );
  }, []);

  useEffect(() => {
    return () => breachTimers.current.forEach(clearTimeout);
  }, []);

  const initiateBreach = useCallback(() => {
    if (phase !== "locked") return;
    setPhase("breaching");
    playSfx("breach");

    const totalDuration = 2800;
    const lineDelay = totalDuration / SCAN_LINES.length;

    SCAN_LINES.forEach((line, i) => {
      const t = setTimeout(() => {
        setScanLine(i);
        setProgress(((i + 1) / SCAN_LINES.length) * 100);
        playSfx("scan");

        let charIdx = 0;
        const typeInterval = setInterval(() => {
          setTypedText(line.slice(0, charIdx + 1));
          charIdx++;
          if (charIdx >= line.length) clearInterval(typeInterval);
        }, 16);

        setHexStream((prev) => [
          ...prev.slice(-6),
          `0x${randHex(4)} → 0x${randHex(4)} [${i < SCAN_LINES.length - 1 ? "PROC" : "DONE"}]`,
        ]);
      }, i * lineDelay);
      breachTimers.current.push(t);
    });

    const finishT = setTimeout(() => {
      playSfx("unlock");
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 300);
      setTimeout(() => {
        setPhase("unlocked");
        playSfx("powerUp");
      }, 500);
    }, totalDuration + 200);
    breachTimers.current.push(finishT);
  }, [phase, playSfx]);

  const skip = useCallback(() => {
    breachTimers.current.forEach(clearTimeout);
    setPhase("unlocked");
  }, []);

  return (
    <>
      <AnimatePresence>
        {phase !== "unlocked" && (
          <motion.section
            key="breach"
            exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            id="breach"
            className="gaming-section py-16 lg:pl-20 relative overflow-hidden"
          >
            <div className="grid-overlay" />
            <div className="max-w-4xl mx-auto px-4">
              <div className="text-center mb-8">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="section-heading mb-2"
                >ACCESS WEB ARSENAL</motion.h2>
                <p className="font-mono text-sm text-slate-500">
                  {">"}  Initiate web-breach to access classified projects
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="gaming-card !p-0 overflow-hidden relative"
              >
                <div className="hud-corner hud-corner-tl" />
                <div className="hud-corner hud-corner-tr" />
                <div className="hud-corner hud-corner-bl" />
                <div className="hud-corner hud-corner-br" />

                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gaming-border bg-gaming-dark/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neon-red" />
                    <span className="w-2 h-2 rounded-full bg-neon-yellow" />
                    <span className="w-2 h-2 rounded-full bg-neon-green" />
                    <span className="font-mono text-[10px] text-slate-600 ml-2">web_breach_v4.exe</span>
                  </div>
                  <span className="font-gaming text-[9px] tracking-widest text-slate-600">
                    {phase === "locked" ? "STANDBY" : "EXECUTING"}
                  </span>
                </div>

                <div className="relative bg-[#080810] p-5 min-h-[260px]">
                  <div className="absolute inset-0 overflow-hidden opacity-[0.06] pointer-events-none">
                    {matrixCols.map((col, i) => (
                      <div key={i} className="absolute top-0 font-mono text-[10px] text-neon-green leading-[14px] whitespace-nowrap"
                        style={{ left: `${col.left}%`, animation: `matrixDrop ${col.speed}s linear ${col.delay}s infinite` }}>
                        {col.chars.map((c, j) => <div key={j}>{c}</div>)}
                      </div>
                    ))}
                  </div>

                  {phase === "breaching" && (
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(212,168,83,0.015) 2px, rgba(212,168,83,0.015) 4px)" }} />
                  )}

                  {phase === "locked" && (
                    <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[200px] gap-5">
                      <motion.div
                        animate={{ boxShadow: [
                          "0 0 20px rgba(212,168,83,0.2)",
                          "0 0 40px rgba(212,168,83,0.4)",
                          "0 0 20px rgba(212,168,83,0.2)",
                        ]}}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-20 h-20 border-2 border-neon-cyan/40 rounded-full flex items-center justify-center"
                      >
                        <motion.div
                          animate={{ rotateY: [0, 360] }}
                          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                          className="text-3xl" style={{ transformStyle: "preserve-3d" }}
                        >🔐</motion.div>
                      </motion.div>

                      <div className="text-center">
                        <p className="font-gaming text-sm tracking-widest text-slate-400 mb-1">CLASSIFIED DARK PROJECTS</p>
                        <p className="font-mono text-xs text-slate-600">Security clearance required</p>
                      </div>

                      <motion.button
                        onClick={initiateBreach}
                        whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(212,168,83,0.3), 0 0 60px rgba(212,168,83,0.1)" }}
                        whileTap={{ scale: 0.96 }}
                        className="relative gaming-btn liquid-btn !px-10 !py-3.5"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                          INITIATE BREACH
                        </span>
                      </motion.button>

                      <button onClick={skip}
                        className="font-mono text-[10px] text-slate-700 hover:text-slate-500 transition-colors">
                        skip protocol →
                      </button>
                    </div>
                  )}

                  {phase === "breaching" && (
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-gaming text-[10px] tracking-widest text-neon-red animate-flicker">⚠ BREACH IN PROGRESS</span>
                        <span className="font-mono text-[10px] text-slate-600">{Math.round(progress)}%</span>
                      </div>

                      <div className="relative h-1.5 bg-gaming-dark rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          style={{ background: "linear-gradient(90deg, #D4A853, #6B5B95, #8896A8)",
                            boxShadow: "0 0 10px rgba(212,168,83,0.5), 0 0 20px rgba(212,168,83,0.2)" }} />
                        <motion.div
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-neon-cyan"
                          animate={{ left: `${progress}%` }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          style={{ boxShadow: "0 0 12px rgba(212,168,83,0.8)", marginLeft: -6 }} />
                      </div>

                      <div className="space-y-0.5 font-mono text-[11px] text-neon-green/60">
                        {hexStream.map((line, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.15 }}>{line}</motion.div>
                        ))}
                      </div>

                      <div className="border border-gaming-border bg-gaming-dark/60 px-3 py-2 mt-2">
                        <span className="font-mono text-xs text-neon-cyan">
                          {"> "}{typedText}<span className="animate-pulse ml-0.5">▊</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-center gap-3 mt-3 opacity-50">
                        {SCAN_LINES.map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full border transition-all duration-500 ${
                              i <= scanLine
                                ? "bg-neon-cyan border-neon-cyan shadow-[0_0_8px_rgba(212,168,83,0.6)]"
                                : "border-slate-700"
                            }`} />
                            {i < SCAN_LINES.length - 1 && (
                              <div className={`w-8 h-px transition-all duration-500 ${
                                i < scanLine ? "bg-neon-cyan/60" : "bg-slate-800"
                              }`} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {showFlash && (
                      <motion.div
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 z-30 bg-neon-cyan/20"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "unlocked" && (
          <motion.div key="projects"
            initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >{children}</motion.div>
        )}
      </AnimatePresence>

      {phase === "locked" && <div className="h-0" />}

      <style jsx>{`
        @keyframes matrixDrop {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(300px); opacity: 0; }
        }
      `}</style>
    </>
  );
}
