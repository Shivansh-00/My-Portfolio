"use client";

import type { ExperienceItem } from "@/types/api";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

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
      initial={{ opacity: 0, x: -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="relative pl-8 md:pl-12"
    >
      {/* Timeline */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-neon-cyan/50 via-neon-cyan/20 to-transparent" />

      {/* Timeline node */}
      <div className="absolute left-0 top-6 -translate-x-1/2">
        <motion.div
          animate={
            isActive
              ? {
                  boxShadow: [
                    "0 0 5px rgba(0,240,255,0.5)",
                    "0 0 20px rgba(0,240,255,0.8)",
                    "0 0 5px rgba(0,240,255,0.5)",
                  ],
                }
              : {}
          }
          transition={
            isActive ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}
          }
          className={`w-3 h-3 rotate-45 border ${
            isActive
              ? "border-neon-cyan bg-neon-cyan/20"
              : "border-slate-600 bg-gaming-dark"
          }`}
        />
      </div>

      {/* Card */}
      <div className={`gaming-card ${isActive ? "" : "gaming-card-green"} mb-8`}>
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-br" />

        {/* Status badge */}
        <div className="flex items-center gap-3 mb-4">
          {isActive ? (
            <span className="gaming-tag !border-neon-green/40 !text-neon-green !bg-neon-green/5">
              <span className="inline-block w-1.5 h-1.5 bg-neon-green rounded-full mr-1.5 animate-pulse" />
              ACTIVE QUEST
            </span>
          ) : (
            <span className="gaming-tag !border-slate-600 !text-slate-500 !bg-slate-800/30">
              ✓ COMPLETED
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-gaming text-lg md:text-xl uppercase tracking-wide neon-text-cyan mb-2">
          {item.title}
        </h3>

        {/* Organization & dates */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="font-body text-sm text-neon-magenta">
            ◇ {item.organization}
          </span>
          <span className="font-mono text-xs text-slate-500">
            [{item.startDate} → {item.endDate ?? "PRESENT"}]
          </span>
        </div>

        {/* Highlights as quest objectives */}
        <div className="space-y-3">
          <p className="font-mono text-[10px] text-slate-600 uppercase tracking-wider">
            Quest Objectives:
          </p>
          {item.highlights.map((highlight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.2 + (i + 1) * 0.1 }}
              className="flex items-start gap-3 pl-3 border-l border-gaming-border"
            >
              <span className="neon-text-green text-xs mt-0.5">▸</span>
              <span className="font-body text-sm text-slate-300 leading-relaxed">
                {highlight}
              </span>
            </motion.div>
          ))}
        </div>

        {/* XP bar decoration */}
        <div className="mt-5 pt-4 border-t border-gaming-border">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-[10px] text-slate-600">
              QUEST_XP
            </span>
            <span className="font-mono text-[10px] neon-text-cyan">
              +{(index + 1) * 500} XP
            </span>
          </div>
          <div className="xp-bar">
            <motion.div
              className="xp-bar-fill"
              initial={{ width: 0 }}
              animate={inView ? { width: "100%" } : {}}
              transition={{
                duration: 1.5,
                delay: index * 0.2 + 0.5,
                ease: "easeOut",
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ExperienceSection({
  experience,
}: {
  experience: ExperienceItem[];
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="experience" ref={ref} className="gaming-section py-20 lg:pl-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-heading mb-4"
        >
          Quest Log
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-mono text-xs text-slate-500 mb-12"
        >
          {">"} QUEST_LOG.retrieve() — {experience.length} QUESTS ON RECORD
        </motion.p>

        <div className="relative">
          {experience.map((item, i) => (
            <QuestCard key={item.id} item={item} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
