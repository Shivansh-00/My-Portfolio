"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import GamingNavbar from "@/components/gaming-navbar";
import GamingFooter from "@/components/gaming-footer";
import { AudioProvider } from "@/components/audio-provider";
import AudioControl from "@/components/audio-control";
import { MagneticCursor } from "@/components/motion-primitives";
import BootScreen from "@/components/boot-screen";

const ThreeBackground = dynamic(
  () => import("@/components/three-background"),
  {
    ssr: false,
    loading: () => null,
  }
);

function SafeThreeBackground() {
  try {
    return <ThreeBackground />;
  } catch {
    return null;
  }
}

/* ── Scroll Progress — multi-layer neon bar ── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const glowOpacity = useTransform(scrollYProgress, [0, 0.02, 1], [0, 1, 1]);

  return (
    <>
      {/* Main bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-50 origin-left"
        style={{
          scaleX,
          opacity: glowOpacity,
          background: "linear-gradient(90deg, #DC143C, #a855f7, #1E90FF, #39ff14)",
          boxShadow:
            "0 0 10px rgba(220,20,60,0.5), 0 0 20px rgba(220,20,60,0.2)",
        }}
      />
      {/* Under-glow layer */}
      <motion.div
        className="fixed top-[2px] left-0 right-0 h-[6px] z-50 origin-left pointer-events-none"
        style={{
          scaleX,
          opacity: useTransform(glowOpacity, [0, 1], [0, 0.3]),
          background: "linear-gradient(90deg, #DC143C22, #a855f722, #1E90FF22)",
          filter: "blur(4px)",
        }}
      />
    </>
  );
}

/* ── HUD Corner Brackets ── */
function HUDFrame() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[42]">
      {/* Top-left */}
      <div className="absolute top-3 left-3 w-8 h-8">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-neon-cyan/30 to-transparent" />
        <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-neon-cyan/30 to-transparent" />
      </div>
      {/* Top-right */}
      <div className="absolute top-3 right-3 w-8 h-8">
        <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-neon-cyan/30 to-transparent" />
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-neon-cyan/30 to-transparent" />
      </div>
      {/* Bottom-left */}
      <div className="absolute bottom-3 left-3 w-8 h-8">
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-neon-magenta/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-[1px] h-full bg-gradient-to-t from-neon-magenta/20 to-transparent" />
      </div>
      {/* Bottom-right */}
      <div className="absolute bottom-3 right-3 w-8 h-8">
        <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-neon-magenta/20 to-transparent" />
        <div className="absolute bottom-0 right-0 w-[1px] h-full bg-gradient-to-t from-neon-magenta/20 to-transparent" />
      </div>
    </div>
  );
}

/* ── FPS-style status telemetry ── */
function StatusTelemetry() {
  const [fps, setFps] = useState(60);
  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf: number;
    const tick = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        setFps(frames);
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed top-4 right-20 z-[43] pointer-events-none hidden lg:flex items-center gap-3">
      <span className="font-mono text-[9px] text-slate-700 tracking-wider">
        SYS <span className="text-neon-green/60">{fps}</span> FPS
      </span>
      <span className="font-mono text-[9px] text-slate-700 tracking-wider">
        RENDER <span className="text-neon-cyan/60">●</span> ACTIVE
      </span>
    </div>
  );
}

export default function GamingShell({ children }: { children: React.ReactNode }) {
  return (
    <AudioProvider>
      {/* Boot sequence overlay */}
      <BootScreen />

      {/* Scroll progress indicator */}
      <ScrollProgress />

      <SafeThreeBackground />
      <MagneticCursor />
      <HUDFrame />
      <StatusTelemetry />

      {/* Scanlines overlay for CRT immersion */}
      <div
        className="pointer-events-none fixed inset-0 z-[45] opacity-[0.012]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(220,20,60,0.06) 2px, rgba(220,20,60,0.06) 4px)",
        }}
      />

      {/* Animated noise texture */}
      <div className="noise-bg" />

      {/* Subtle vignette overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[41]"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      <GamingNavbar />
      <main className="relative z-10">{children}</main>
      <GamingFooter />
      <AudioControl />
    </AudioProvider>
  );
}
