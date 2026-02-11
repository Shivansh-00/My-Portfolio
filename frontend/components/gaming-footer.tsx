"use client";

import { motion } from "framer-motion";

export default function GamingFooter() {
  return (
    <footer className="relative py-12 lg:pl-20 border-t border-gaming-border">
      <div className="grid-overlay" />
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-neon-cyan/40 rotate-45 flex items-center justify-center">
              <span className="font-gaming text-[10px] neon-text-cyan -rotate-45">
                SS
              </span>
            </div>
            <div>
              <p className="font-gaming text-xs tracking-widest neon-text-cyan">
                SHIVANSH SRIVASTAVA
              </p>
              <p className="font-mono text-[9px] text-slate-600">
                AI ENGINEER · FULL-STACK · PORTFOLIO v2.0
              </p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" />
              <span className="font-mono text-[10px] text-slate-600">
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
            <div className="h-4 w-px bg-gaming-border" />
            <span className="font-mono text-[10px] text-slate-600">
              BUILT WITH NEXT.JS + THREE.JS
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-gaming-border/50 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="font-mono text-[10px] text-slate-700"
          >
            {"// "}© {new Date().getFullYear()} SHIVANSH SRIVASTAVA — ALL RIGHTS
            RESERVED {"//"}
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
