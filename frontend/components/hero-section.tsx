"use client";

import type { Profile } from "@/types/api";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

export default function HeroSection({ profile }: { profile: Profile }) {
  return (
    <section className="section-card">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-brand-500">
          Production-Grade Portfolio
        </p>
        <h1 className="text-4xl font-semibold md:text-5xl">
          {profile.name}
        </h1>
        <p className="text-lg text-slate-300">{profile.role}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <a className="text-brand-500" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <a className="text-slate-300" href={profile.linkedin}>
            LinkedIn
          </a>
          <a className="text-slate-300" href={profile.github}>
            GitHub
          </a>
          <a className="text-slate-300" href={profile.leetcode}>
            LeetCode
          </a>
        </div>
      </motion.div>
    </section>
  );
}
