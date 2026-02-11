"use client";

import type { Project } from "@/types/api";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState } from "react";

function ProjectCard({
  project,
  index,
  inView,
}: {
  project: Project;
  index: number;
  inView: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`gaming-card group cursor-pointer ${
        project.featured ? "" : "gaming-card-green"
      }`}
    >
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      {/* Status bar */}
      <div className="flex items-center justify-between mb-4">
        {project.featured ? (
          <span className="gaming-tag !border-neon-magenta/40 !text-neon-magenta !bg-neon-magenta/5">
            ★ LEGENDARY
          </span>
        ) : (
          <span className="gaming-tag">◆ STANDARD</span>
        )}
        <span className="font-mono text-[10px] text-slate-600">
          ID:{project.id.slice(0, 8)}
        </span>
      </div>

      {/* Project name */}
      <h3
        className={`font-gaming text-lg md:text-xl uppercase tracking-wider mb-3 transition-all duration-300 ${
          project.featured ? "neon-text-magenta" : "neon-text-cyan"
        }`}
      >
        {project.name}
      </h3>

      {/* Description */}
      <p className="font-body text-sm text-slate-400 leading-relaxed mb-5">
        {project.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="font-mono text-[10px] px-2 py-0.5 border border-gaming-border text-slate-500
                       bg-gaming-dark/50 uppercase tracking-wider
                       group-hover:border-neon-cyan/30 group-hover:text-slate-400 transition-all duration-300"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Action links */}
      <div className="pt-4 border-t border-gaming-border flex gap-4">
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-gaming text-xs uppercase tracking-widest text-slate-500
                     hover:text-neon-cyan transition-all duration-300 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span>⬡</span> Source
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-gaming text-xs uppercase tracking-widest text-slate-500
                     hover:text-neon-green transition-all duration-300 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span>▶</span> Deploy
          </a>
        )}
      </div>

      {/* Hover glow line at bottom */}
      <motion.div
        className={`absolute bottom-0 left-0 h-[2px] ${
          project.featured
            ? "bg-gradient-to-r from-neon-magenta via-neon-purple to-transparent"
            : "bg-gradient-to-r from-neon-cyan via-neon-blue to-transparent"
        }`}
        initial={{ width: "0%" }}
        animate={{ width: isHovered ? "100%" : "0%" }}
        transition={{ duration: 0.4 }}
      />
    </motion.article>
  );
}

export default function ProjectsSection({
  projects,
}: {
  projects: Project[];
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });

  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  return (
    <section id="projects" ref={ref} className="gaming-section py-20 lg:pl-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-heading mb-4"
        >
          Arsenal
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-mono text-xs text-slate-500 mb-12"
        >
          {">"} ARSENAL.scan() — {projects.length} WEAPONS FORGED
        </motion.p>

        {/* Featured projects */}
        {featured.length > 0 && (
          <div className="mb-10">
            <p className="font-gaming text-xs uppercase tracking-[0.3em] text-neon-magenta/60 mb-6">
              ★ Legendary Items
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {featured.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                  inView={inView}
                />
              ))}
            </div>
          </div>
        )}

        {/* Other projects */}
        {others.length > 0 && (
          <div>
            <p className="font-gaming text-xs uppercase tracking-[0.3em] text-slate-600 mb-6">
              ◆ Inventory
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {others.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={featured.length + i}
                  inView={inView}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
