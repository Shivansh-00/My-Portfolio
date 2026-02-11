"use client";

import { useRef, useEffect, useState } from "react";
import type { Profile } from "@/types/api";
import { motion } from "framer-motion";
import { useSfx } from "@/lib/use-sfx";

const STATUS_LINES = [
  "> SYSTEM BOOT SEQUENCE INITIATED...",
  "> LOADING NEURAL NETWORKS...",
  "> CALIBRATING AI MODELS...",
  "> PORTFOLIO SYSTEMS ONLINE ▮",
];

function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span className="font-mono text-xs md:text-sm text-neon-green/70">
      {displayed}
      {displayed.length < text.length && started && (
        <span className="animate-pulse">▮</span>
      )}
    </span>
  );
}

export default function HeroSection({ profile }: { profile: Profile }) {
  const sectionRef = useRef<HTMLElement>(null);
  const sfx = useSfx();

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="gaming-section min-h-screen flex items-center justify-center relative"
    >
      {/* Grid overlay */}
      <div className="grid-overlay" />

      {/* HUD corners */}
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <div className="relative z-10 max-w-5xl mx-auto text-center px-4">
        {/* Status tag */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <span className="gaming-tag">
            <span className="inline-block w-2 h-2 bg-neon-green rounded-full mr-2 animate-pulse" />
            SYSTEM ONLINE — PLAYER DETECTED
          </span>
        </motion.div>

        {/* Name with glitch effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h1
            className="font-gaming text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-wider
                       glitch-text neon-text-cyan mb-4"
            data-text={profile.name}
          >
            {profile.name}
          </h1>
        </motion.div>

        {/* Role */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-8"
        >
          <p className="font-gaming text-sm md:text-lg tracking-[0.2em] uppercase text-slate-400">
            {"{"}
            <span className="neon-text-magenta mx-2">{profile.role}</span>
            {"}"}
          </p>
        </motion.div>

        {/* Terminal lines */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.2 }}
          className="max-w-xl mx-auto text-left space-y-1 mb-10 bg-gaming-dark/60 border border-gaming-border p-4 rounded-sm"
        >
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gaming-border">
            <span className="w-2 h-2 rounded-full bg-neon-red" />
            <span className="w-2 h-2 rounded-full bg-neon-yellow" />
            <span className="w-2 h-2 rounded-full bg-neon-green" />
            <span className="font-mono text-[10px] text-slate-600 ml-2">
              terminal@shivansh:~
            </span>
          </div>
          {STATUS_LINES.map((line, i) => (
            <div key={i}>
              <TypingText text={line} delay={1400 + i * 600} />
            </div>
          ))}
        </motion.div>

        {/* CTA links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="gaming-btn"
            {...sfx.hover}
            onClick={() => sfx.play("click")}
          >
            ⬡ GitHub
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="gaming-btn"
            {...sfx.hover}
            onClick={() => sfx.play("click")}
          >
            ◆ LinkedIn
          </a>
          <a
            href={profile.leetcode}
            target="_blank"
            rel="noopener noreferrer"
            className="gaming-btn"
            {...sfx.hover}
            onClick={() => sfx.play("click")}
          >
            ◈ LeetCode
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="gaming-btn"
            {...sfx.hover}
            onClick={() => sfx.play("click")}
          >
            ◇ Contact
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="mt-16"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex flex-col items-center gap-2"
          >
            <span className="font-mono text-[10px] tracking-widest text-slate-600 uppercase">
              Scroll to explore
            </span>
            <div className="w-5 h-8 border border-slate-600 rounded-full flex justify-center pt-1.5">
              <motion.div
                animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-1 h-1 rounded-full bg-neon-cyan"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

