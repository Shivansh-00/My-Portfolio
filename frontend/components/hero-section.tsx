"use client";

import { useRef, useEffect, useState } from "react";
import type { Profile } from "@/types/api";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSfx } from "@/lib/use-sfx";
import { AnimatedText, FloatingParticles } from "./motion-primitives";
import {
  fadeInUp,
  fadeIn,
  staggerContainer,
  staggerItem,
  scaleIn,
} from "@/lib/animations";

const STATUS_LINES = [
  "> WEB-SHOOTER SYSTEMS CALIBRATED...",
  "> SPIDER-SENSE NETWORK ACTIVE...",
  "> SCANNING CITY SKYLINE...",
  "> ALL WEBS OPERATIONAL ▮",
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
    }, 20);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span className="font-mono text-xs md:text-sm text-neon-green/70">
      {displayed}
      {displayed.length < text.length && started && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          ▮
        </motion.span>
      )}
    </span>
  );
}

function OrbitRing({ size, duration, delay, color }: {
  size: number; duration: number; delay: number; color: string;
}) {
  return (
    <motion.div
      className="absolute rounded-full border pointer-events-none"
      style={{
        width: size,
        height: size,
        borderColor: color,
        top: "50%",
        left: "50%",
        marginTop: -size / 2,
        marginLeft: -size / 2,
      }}
      initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
      animate={{ opacity: [0, 0.3, 0.1, 0.3, 0], scale: 1, rotate: 360 }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    />
  );
}

export default function HeroSection({ profile }: { profile: Profile }) {
  const sectionRef = useRef<HTMLElement>(null);
  const sfx = useSfx();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.3], [0.5, 0]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="gaming-section min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      <motion.div className="grid-overlay" style={{ opacity: gridOpacity }} />
      <FloatingParticles count={25} />

      <OrbitRing size={500} duration={30} delay={0} color="rgba(220,20,60,0.08)" />
      <OrbitRing size={700} duration={40} delay={2} color="rgba(30,144,255,0.06)" />
      <OrbitRing size={300} duration={20} delay={1} color="rgba(57,255,20,0.06)" />
      <OrbitRing size={900} duration={50} delay={3} color="rgba(168,85,247,0.04)" />

      {/* Corner coordinates */}
      <div className="absolute top-4 left-4 lg:left-20 font-mono text-[9px] text-slate-700 z-20 hidden md:block">
        <div>WEB::HERO_MODULE</div>
        <div>WEB: ACTIVE</div>
      </div>
      <div className="absolute top-4 right-4 font-mono text-[9px] text-slate-700 z-20 hidden md:block text-right">
        <div>FRAME: 60FPS</div>
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 3, repeat: Infinity }}>
          SIGNAL: STRONG
        </motion.div>
      </div>

      {/* Radial spotlight */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(220,20,60,0.06) 0%, transparent 70%)",
          top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <motion.div
        className="relative z-10 max-w-5xl mx-auto text-center px-4"
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
      >
        {/* Status tag */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-6">
          <motion.span
            className="gaming-tag"
            animate={{ boxShadow: [
              "0 0 5px rgba(57,255,20,0.2)",
              "0 0 20px rgba(57,255,20,0.5)",
              "0 0 5px rgba(57,255,20,0.2)",
            ]}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="inline-block w-2 h-2 bg-neon-green rounded-full mr-2 animate-pulse" />
            WEB ACTIVE — HERO DETECTED
          </motion.span>
        </motion.div>

        {/* Name */}
        <motion.div variants={scaleIn} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <h1
            className="font-gaming text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-wider neon-text-cyan mb-4 whitespace-nowrap chromatic-text"
            style={{ cursor: "default" }}
          >
            SHIVANSH SRIVASTAVA
          </h1>
          <motion.div
            className="h-[2px] mx-auto mt-1 rounded-full"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "60%", opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "linear-gradient(90deg, transparent, #DC143C, #a855f7, #1E90FF, transparent)",
              boxShadow: "0 0 12px rgba(220,20,60,0.3)",
            }}
          />
        </motion.div>

        {/* Role */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 1 }} className="mb-8">
          <motion.p
            className="font-gaming text-sm md:text-lg tracking-[0.2em] uppercase text-slate-400"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {"{"}<span className="neon-text-magenta mx-2">{profile.role}</span>{"}"}
          </motion.p>
        </motion.div>

        {/* Terminal */}
        <motion.div
          variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 1.2 }}
          className="max-w-xl mx-auto text-left space-y-1 mb-10 terminal-card"
        >
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gaming-border">
            <motion.span className="w-2 h-2 rounded-full bg-neon-red" whileHover={{ scale: 1.5 }} />
            <motion.span className="w-2 h-2 rounded-full bg-neon-yellow" whileHover={{ scale: 1.5 }} />
            <motion.span className="w-2 h-2 rounded-full bg-neon-green" whileHover={{ scale: 1.5 }} />
            <span className="font-mono text-[10px] text-slate-600 ml-2">web-console@shivansh:~</span>
            <span className="ml-auto font-mono text-[9px] text-neon-green/50">WEB 100%</span>
          </div>
          {STATUS_LINES.map((line, i) => (
            <div key={i}><TypingText text={line} delay={1400 + i * 600} /></div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={staggerContainer(0.1, 1.8)} initial="hidden" animate="visible"
          className="flex flex-wrap justify-center gap-4"
        >
          {[
            { href: profile.github, label: "◇ GitHub" },
            { href: profile.linkedin, label: "◆ LinkedIn" },
            { href: profile.leetcode, label: "◈ LeetCode" },
            { href: `mailto:${profile.email}`, label: "✉ Contact" },
          ].map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="gaming-btn liquid-btn"
              variants={staggerItem}
              whileHover={{ scale: 1.08, boxShadow: "0 0 30px rgba(220,20,60,0.4), 0 0 60px rgba(220,20,60,0.15)" }}
              whileTap={{ scale: 0.95 }}
              {...sfx.hover}
              onClick={() => sfx.play("click")}
            >
              {link.label}
            </motion.a>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} className="mt-16">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex flex-col items-center gap-2"
          >
            <motion.span
              className="font-mono text-[10px] tracking-widest text-slate-600 uppercase"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >Scroll to explore</motion.span>
            <div className="w-5 h-8 border border-slate-600 rounded-full flex justify-center pt-1.5">
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 h-1 rounded-full bg-neon-cyan"
                style={{ boxShadow: "0 0 6px rgba(220,20,60,0.8)" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
