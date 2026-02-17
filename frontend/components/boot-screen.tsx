"use client";
import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_LINES = [
  { text: "BATCOMPUTER v7.3.1 — INITIALIZING", delay: 0 },
  { text: "WAYNE ENTERPRISES SECURE MAINFRAME ... CONNECTED", delay: 300 },
  { text: "ENCRYPTED CHANNEL ESTABLISHED ... AES-256-GCM", delay: 600 },
  { text: "LOADING GOTHAM CITY DATABASE ......... OK", delay: 900 },
  { text: "BAT-SUIT DIAGNOSTICS ................ NOMINAL", delay: 1200 },
  { text: "UTILITY BELT SYSTEMS ................ ARMED", delay: 1400 },
  { text: "CAVE NETWORK UPLINK ................. SYNCED", delay: 1600 },
  { text: "CRIMINAL DATABASE SYNC .............. 12,847 ENTRIES", delay: 1800 },
  { text: "NIGHT-VISION AUGMENTATION ........... ACTIVE", delay: 2000 },
  { text: "DARK KNIGHT PROTOCOL ................ ENGAGED", delay: 2200 },
  { text: "", delay: 2500 },
  { text: "► ALL SYSTEMS OPERATIONAL — WELCOME, SIR", delay: 2600 },
];

function BootScreen({ onComplete }: { onComplete?: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"boot" | "done">("boot");
  const [dismissed, setDismissed] = useState(false);

  const skip = useCallback(() => {
    setPhase("done");
    setTimeout(() => {
      setDismissed(true);
      onComplete?.();
    }, 600);
  }, [onComplete]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => setVisibleLines(i + 1), line.delay)
      );
    });

    // progress bar
    const start = Date.now();
    const total = 2800;
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(elapsed / total, 1));
      if (elapsed >= total) clearInterval(tick);
    }, 30);

    // auto-complete
    timers.push(
      setTimeout(() => {
        setPhase("done");
        setTimeout(() => {
          setDismissed(true);
          onComplete?.();
        }, 600);
      }, 3400)
    );

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(tick);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, #0c0c1a 0%, #05050D 70%, #000000 100%)",
          }}
          onClick={skip}
        >
          {/* Bat-Signal Glow */}
          <div
            className="absolute w-96 h-96 rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, rgba(212,168,83,0.4) 0%, transparent 70%)",
              top: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              filter: "blur(60px)",
            }}
          />

          {/* scan-line overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(212,168,83,0.015) 2px, rgba(212,168,83,0.015) 4px)",
            }}
          />

          {/* terminal */}
          <div className="relative w-full max-w-2xl px-6">
            {/* header */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <span
                className="font-mono text-xs tracking-[0.3em] uppercase"
                style={{ color: "rgba(212,168,83,0.5)" }}
              >
                BATCOMPUTER_TERMINAL
              </span>
              <div className="flex-1" />
              <span
                className="font-mono text-xs"
                style={{ color: "rgba(136,150,168,0.4)" }}
              >
                [CLICK TO SKIP]
              </span>
            </div>

            {/* boot lines */}
            <div className="space-y-1 mb-8 font-mono text-sm min-h-[280px]">
              {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className={
                    line.text.startsWith("►")
                      ? "text-yellow-400 font-bold mt-2"
                      : line.text === ""
                      ? "h-3"
                      : "text-slate-400"
                  }
                >
                  {line.text && (
                    <>
                      <span style={{ color: "rgba(212,168,83,0.4)" }}>
                        {"> "}
                      </span>
                      {line.text}
                    </>
                  )}
                </motion.div>
              ))}
              {visibleLines < BOOT_LINES.length && (
                <span
                  className="inline-block w-2 h-4 ml-4 animate-pulse"
                  style={{ backgroundColor: "rgba(212,168,83,0.7)" }}
                />
              )}
            </div>

            {/* progress bar */}
            <div className="relative">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span style={{ color: "rgba(212,168,83,0.5)" }}>
                  SYSTEM INIT
                </span>
                <span style={{ color: "rgba(212,168,83,0.7)" }}>
                  {Math.round(progress * 100)}%
                </span>
              </div>
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: "rgba(212,168,83,0.1)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress * 100}%`,
                    background:
                      "linear-gradient(90deg, #D4A853, #FFD700)",
                    boxShadow: "0 0 12px rgba(212,168,83,0.5)",
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(BootScreen);
