"use client";

import type { SkillCategory } from "@/types/api";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const SKILL_ICONS: Record<string, string> = {
  "Programming Languages": "⌘",
  "Web & Data": "◈",
  "Databases": "◆",
  "Enterprise Systems": "⬢",
  "Data Structures": "◇",
  "Tools": "⚙",
};

function SkillOrb({ skill, index, inView }: { skill: string; index: number; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      whileHover={{
        scale: 1.1,
        boxShadow: "0 0 20px rgba(0,240,255,0.4), 0 0 40px rgba(0,240,255,0.1)",
      }}
      className="gaming-tag cursor-default select-none transition-all duration-200
                 hover:bg-neon-cyan/10 hover:text-neon-cyan hover:border-neon-cyan/60"
    >
      {skill}
    </motion.div>
  );
}

function SkillCategoryCard({
  category,
  index,
  inView,
}: {
  category: SkillCategory;
  index: number;
  inView: boolean;
}) {
  const icon = SKILL_ICONS[category.name] || "◆";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="gaming-card group"
    >
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-br" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 border border-neon-cyan/30 flex items-center justify-center
                     group-hover:border-neon-cyan/60 transition-all duration-300"
          style={{
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        >
          <span className="text-lg neon-text-cyan">{icon}</span>
        </div>
        <div>
          <h3 className="font-gaming text-sm uppercase tracking-widest neon-text-cyan">
            {category.name}
          </h3>
          <p className="font-mono text-[10px] text-slate-600">
            SKILL_TREE::LVL_{category.skills.length}
          </p>
        </div>
        <div className="ml-auto">
          <span className="font-mono text-xs text-neon-purple">
            {category.skills.length} skills
          </span>
        </div>
      </div>

      {/* XP bar */}
      <div className="xp-bar mb-5">
        <motion.div
          className="xp-bar-fill"
          initial={{ width: 0 }}
          animate={inView ? { width: `${Math.min(category.skills.length * 12, 100)}%` } : {}}
          transition={{ duration: 1.2, delay: index * 0.15 + 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2">
        {category.skills.map((skill, i) => (
          <SkillOrb key={skill} skill={skill} index={i} inView={inView} />
        ))}
      </div>
    </motion.div>
  );
}

export default function SkillsSection({
  skills,
}: {
  skills: SkillCategory[];
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="skills" ref={ref} className="gaming-section py-20 lg:pl-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-heading mb-4"
        >
          Skill Tree
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-mono text-xs text-slate-500 mb-12"
        >
          {">"} SKILL_INVENTORY.load() — {skills.reduce((a, c) => a + c.skills.length, 0)} ABILITIES UNLOCKED
        </motion.p>

        <div className="grid gap-6 md:grid-cols-2">
          {skills.map((category, i) => (
            <SkillCategoryCard
              key={category.id}
              category={category}
              index={i}
              inView={inView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
