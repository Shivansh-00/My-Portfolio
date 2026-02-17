"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const TECH = ["NEXT.JS", "THREE.JS", "WEB AUDIO", "FRAMER MOTION", "PRISMA"];

export default function GamingFooter() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <footer ref={ref} className="relative py-16 lg:pl-20 border-t border-gaming-border overflow-hidden">
      <div className="grid-overlay" />

      {/* Animated gradient line at top */}
      <motion.div
        className="absolute top-0 left-0 h-[1px] bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-green"
        initial={{ width: "0%" }}
        animate={inView ? { width: "100%" } : {}}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* ── Top Row — Brand / Status ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row items-center justify-between gap-8"
        >
          {/* Brand */}
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.15 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="relative w-10 h-10 border border-neon-cyan/40 rotate-45 flex items-center justify-center cursor-pointer shrink-0"
            >
              <span className="font-gaming text-xs neon-text-cyan -rotate-45 select-none">BK</span>
              <motion.div
                className="absolute inset-0 border border-neon-cyan/15 rotate-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
            <div className="min-w-0">
              <p className="font-gaming text-sm sm:text-base tracking-[0.15em] neon-text-cyan truncate">
                SHIVANSH SRIVASTAVA
              </p>
              <p className="font-mono text-[10px] text-slate-500 tracking-wide">
                AI ENGINEER · FULL-STACK DEVELOPER · PORTFOLIO v4.0
              </p>
            </div>
          </div>

          {/* Status Cluster */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <motion.span
                className="w-2 h-2 bg-neon-green rounded-full shrink-0"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ boxShadow: "0 0 8px rgba(57,255,20,0.6)" }}
              />
              <span className="font-mono text-[10px] text-slate-500 uppercase whitespace-nowrap">
                All Systems Operational
              </span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-gaming-border" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-slate-600 whitespace-nowrap">
                UPTIME <span className="neon-text-cyan">99.9%</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Tech Stack Marquee ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {TECH.map((tech, i) => (
            <motion.span
              key={tech}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
              className="px-3 py-1 border border-gaming-border text-[10px] font-mono text-slate-500
                         hover:border-neon-cyan/40 hover:text-slate-300 transition-all duration-300 cursor-default"
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>

        {/* ── Divider ── */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 h-px bg-gradient-to-r from-transparent via-gaming-border to-transparent origin-center"
        />

        {/* ── Bottom Row — Copyright ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p className="font-mono text-[10px] text-slate-700 text-center sm:text-left">
            {"// "}© {new Date().getFullYear()} SHIVANSH SRIVASTAVA — ALL RIGHTS RESERVED {"//"}
          </p>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="font-mono text-[10px]">BUILT WITH</span>
            <motion.span
              animate={{ color: ["#D4A853", "#8896A8", "#39ff14", "#D4A853"] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="font-mono text-[10px]"
            >{"</>  &  ♥"}</motion.span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
