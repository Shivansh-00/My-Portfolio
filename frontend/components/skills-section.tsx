"use client";

import type { SkillCategory } from "@/types/api";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { TiltCard } from "./motion-primitives";
import {
  staggerContainer,
  staggerItemScale,
  fadeInUp,
  headingReveal,
  barFill,
} from "@/lib/animations";

const SKILL_ICONS: Record<string, string> = {
  "Programming Languages": "⌘",
  "Web & Data": "◈",
  "Databases": "◆",
  "Enterprise Systems": "⬢",
  "Data Structures": "◇",
  "Tools": "⚙",
};

function SkillOrb({ skill, index }: { skill: string; index: number }) {
  return (
    <motion.div
      variants={staggerItemScale}
      whileHover={{
        scale: 1.15,
        y: -4,
        boxShadow: "0 0 25px rgba(220,20,60,0.5), 0 0 50px rgba(220,20,60,0.15)",
        borderColor: "rgba(220,20,60,0.8)",
        color: "#fff",
      }}
      whileTap={{ scale: 0.9 }}
      className="gaming-tag cursor-default select-none transition-colors duration-200
                 hover:bg-neon-cyan/10 hover:text-neon-cyan hover:border-neon-cyan/60 power-flash"
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
    <TiltCard tiltAmount={6} className="h-full">
      <motion.div
        variants={fadeInUp}
        className="gaming-card group h-full neon-pulse-border"
      >
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-br" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <motion.div
            className="w-10 h-10 border border-neon-cyan/30 flex items-center justify-center
                       group-hover:border-neon-cyan/60 transition-all duration-500"
            whileHover={{ rotate: 60, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
          >
            <span className="text-lg neon-text-cyan">{icon}</span>
          </motion.div>
          <div>
            <h3 className="font-gaming text-sm uppercase tracking-widest neon-text-cyan">
              {category.name}
            </h3>
            <p className="font-mono text-[10px] text-slate-600">
              SKILL_TREE::LVL_{category.skills.length}
            </p>
          </div>
          <div className="ml-auto">
            <motion.span
              className="font-mono text-xs text-neon-purple"
              animate={inView ? { opacity: [0.5, 1, 0.5] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {category.skills.length} skills
            </motion.span>
          </div>
        </div>

        {/* XP bar */}
        <div className="xp-bar mb-5">
          <motion.div
            className="xp-bar-fill"
            initial={{ width: 0 }}
            animate={inView ? { width: `${Math.min(category.skills.length * 12, 100)}%` } : {}}
            transition={{ duration: 1.4, delay: index * 0.15 + 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* Skills with stagger */}
        <motion.div
          className="flex flex-wrap gap-2"
          variants={staggerContainer(0.04, index * 0.1)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {category.skills.map((skill, i) => (
            <SkillOrb key={skill} skill={skill} index={i} />
          ))}
        </motion.div>
      </motion.div>
    </TiltCard>
  );
}

export default function SkillsSection({ skills }: { skills: SkillCategory[] }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="skills" ref={ref} className="gaming-section py-20 lg:pl-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          variants={headingReveal}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="section-heading mb-4"
        >
          Skill Tree
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-mono text-xs text-slate-500 mb-12"
        >
          {">"}  ABILITY_INVENTORY.load() — {skills.reduce((a, c) => a + c.skills.length, 0)} POWERS UNLOCKED
        </motion.p>

        <motion.div
          className="grid gap-6 md:grid-cols-2"
          variants={staggerContainer(0.15, 0.3)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {skills.map((category, i) => (
            <SkillCategoryCard key={category.id} category={category} index={i} inView={inView} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
