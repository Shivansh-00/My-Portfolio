"use client";

import type { ExperienceItem } from "@/types/api";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Reveal } from "./motion-primitives";
import { headingReveal, staggerContainer, staggerItem } from "@/lib/animations";

function QuestCard({
  item,
  index,
  inView,
}: {
  item: ExperienceItem;
  index: number;
  inView: boolean;
}) {
  const isActive = !item.endDate;

  return (
    <motion.div
      initial={{ opacity: 0, x: -60, filter: "blur(8px)" }}
      animate={inView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.8, delay: index * 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative pl-8 md:pl-12"
    >
      {/* Timeline line */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-px"
        style={{ background: "linear-gradient(to bottom, rgba(212,168,83,0.5), rgba(212,168,83,0.1), transparent)", transformOrigin: "top" }}
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 1, delay: index * 0.2, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Timeline node */}
      <div className="absolute left-0 top-6 -translate-x-1/2">
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={inView ? { scale: 1, rotate: 45 } : {}}
          transition={{ duration: 0.5, delay: index * 0.25 + 0.3, type: "spring", stiffness: 300 }}
          className={`w-3 h-3 border ${
            isActive ? "border-neon-cyan bg-neon-cyan/20" : "border-slate-600 bg-gaming-dark"
          }`}
        >
          {isActive && (
            <motion.div
              className="absolute inset-0"
              animate={{
                boxShadow: [
                  "0 0 5px rgba(212,168,83,0.5)",
                  "0 0 25px rgba(212,168,83,0.9)",
                  "0 0 5px rgba(212,168,83,0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.div>
      </div>

      {/* Card */}
      <motion.div
        className={`gaming-card data-stream glass-morph ${isActive ? "" : "gaming-card-green"} mb-8`}
        whileHover={{
          scale: 1.02,
          y: -4,
          boxShadow: isActive
            ? "0 0 30px rgba(212,168,83,0.2), 0 0 60px rgba(212,168,83,0.05)"
            : "0 0 30px rgba(57,255,20,0.15)",
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-br" />

        {/* Status badge */}
        <div className="flex items-center gap-3 mb-4">
          {isActive ? (
            <motion.span
              className="gaming-tag !border-neon-green/40 !text-neon-green !bg-neon-green/5"
              animate={{ borderColor: ["rgba(57,255,20,0.4)", "rgba(57,255,20,0.8)", "rgba(57,255,20,0.4)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="inline-block w-1.5 h-1.5 bg-neon-green rounded-full mr-1.5 animate-pulse" />
              ACTIVE CASE
            </motion.span>
          ) : (
            <span className="gaming-tag !border-slate-600 !text-slate-500 !bg-slate-800/30">✓ CASE CLOSED</span>
          )}
        </div>

        <h3 className="font-gaming text-lg md:text-xl uppercase tracking-wide neon-text-cyan mb-2 electric-underline">
          {item.title}
        </h3>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="font-body text-sm text-neon-magenta">◇ {item.organization}</span>
          <span className="font-mono text-xs text-slate-500">
            [{item.startDate} → {item.endDate ?? "PRESENT"}]
          </span>
        </div>

        {/* Highlights with stagger */}
        <motion.div
          className="space-y-3"
          variants={staggerContainer(0.08, index * 0.2 + 0.3)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <p className="font-mono text-[10px] text-slate-600 uppercase tracking-wider">Case Objectives:</p>
          {item.highlights.map((highlight, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="flex items-start gap-3 pl-3 border-l border-gaming-border hover:border-neon-cyan/40 transition-colors duration-300"
            >
              <motion.span
                className="neon-text-green text-xs mt-0.5"
                whileHover={{ x: 4 }}
              >▸</motion.span>
              <span className="font-body text-sm text-slate-300 leading-relaxed">{highlight}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* XP bar */}
        <div className="mt-5 pt-4 border-t border-gaming-border">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-[10px] text-slate-600">CASE_XP</span>
            <span className="font-mono text-[10px] neon-text-cyan">+{(index + 1) * 500} XP</span>
          </div>
          <div className="xp-bar">
            <motion.div
              className="xp-bar-fill"
              initial={{ width: 0 }}
              animate={inView ? { width: "100%" } : {}}
              transition={{ duration: 1.5, delay: index * 0.2 + 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ExperienceSection({ experience }: { experience: ExperienceItem[] }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="experience" ref={ref} className="gaming-section py-20 lg:pl-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h2
          variants={headingReveal}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="section-heading mb-4"
        >Case Files</motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-mono text-xs text-slate-500 mb-12"
        >{">"}  CASE_FILES.retrieve() — {experience.length} CASES ON RECORD</motion.p>
        <div className="relative">
          {experience.map((item, i) => (
            <QuestCard key={item.id} item={item} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
