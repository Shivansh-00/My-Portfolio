"use client";

import type { Project } from "@/types/api";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useRef, useCallback } from "react";
import { headingReveal, staggerContainer, fadeInUp } from "@/lib/animations";

function ProjectCard({
  project,
  index,
  inView,
}: {
  project: Project;
  index: number;
  inView: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 200, damping: 20 });
  const glareX = useTransform(mouseX, (v) => `${v * 100}%`);
  const glareY = useTransform(mouseY, (v) => `${v * 100}%`);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(220,20,60,0.12) 0%, transparent 60%)`;

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  const handleLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  return (
    <motion.article
      ref={cardRef}
      variants={fadeInUp}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      whileHover={{ scale: 1.04, y: -8 }}
      transition={{ duration: 0.3 }}
      className={`gaming-card group cursor-pointer holo-shimmer relative ${
        project.featured ? "" : "gaming-card-green"
      }`}
    >
      {/* 
        Native <a> overlay — covers the entire card so taps/clicks
        are handled by the browser, NOT by JavaScript.
        Works reliably on every mobile browser.
      */}
      {project.repoUrl && (
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${project.name} on GitHub`}
          className="absolute inset-0 z-20"
        />
      )}

      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      {/* Glare effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: glareBackground }}
      />

      {/* Status bar */}
      <div className="flex items-center justify-between mb-4">
        {project.featured ? (
          <motion.span
            className="gaming-tag !border-neon-magenta/40 !text-neon-magenta !bg-neon-magenta/5"
            animate={{ boxShadow: [
              "0 0 5px rgba(30,144,255,0.1)",
              "0 0 15px rgba(30,144,255,0.3)",
              "0 0 5px rgba(30,144,255,0.1)",
            ]}}
            transition={{ duration: 2, repeat: Infinity }}
          >★ LEGENDARY</motion.span>
        ) : (
          <span className="gaming-tag">◆ STANDARD</span>
        )}
        <span className="font-mono text-[10px] text-slate-600">ID:{project.id.slice(0, 8)}</span>
      </div>

      <h3 className={`font-gaming text-lg md:text-xl uppercase tracking-wider mb-3 transition-all duration-300 electric-underline ${
        project.featured ? "neon-text-magenta" : "neon-text-cyan"
      }`}>{project.name}</h3>

      <p className="font-body text-sm text-slate-400 leading-relaxed mb-5">{project.description}</p>

      {/* Tags with stagger hover */}
      <div className="flex flex-wrap gap-2 mb-5">
        {project.tags.map((tag, i) => (
          <motion.span
            key={tag}
            className="font-mono text-[10px] px-2 py-0.5 border border-gaming-border text-slate-500
                       bg-gaming-dark/50 uppercase tracking-wider
                       group-hover:border-neon-cyan/30 group-hover:text-slate-400 transition-all duration-300"
            whileHover={{ scale: 1.1, borderColor: "rgba(220,20,60,0.6)", color: "#DC143C" }}
          >{tag}</motion.span>
        ))}
      </div>

      {/* Action links — z-30 so they sit ABOVE the card overlay (z-20) */}
      <div className="relative z-30 pt-4 border-t border-gaming-border flex gap-4">
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-gaming text-xs uppercase tracking-widest text-slate-500 hover:text-neon-cyan transition-all duration-300 flex items-center gap-2"
          >
            <span>⬡</span> Source
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-gaming text-xs uppercase tracking-widest text-slate-500 hover:text-neon-green transition-all duration-300 flex items-center gap-2"
          >
            <span>▶</span> Deploy
          </a>
        )}
      </div>

      {/* Bottom glow line */}
      <motion.div
        className={`absolute bottom-0 left-0 h-[2px] ${
          project.featured
            ? "bg-gradient-to-r from-neon-magenta via-neon-purple to-transparent"
            : "bg-gradient-to-r from-neon-cyan via-neon-blue to-transparent"
        }`}
        initial={{ width: "0%" }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.article>
  );
}

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });
  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  return (
    <section id="projects" ref={ref} className="gaming-section py-20 lg:pl-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          variants={headingReveal} initial="hidden" animate={inView ? "visible" : "hidden"}
          className="section-heading mb-4"
        >Web Arsenal</motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-mono text-xs text-slate-500 mb-12"
        >{">"}  WEB_ARSENAL.scan() — {projects.length} PROJECTS FORGED</motion.p>

        {featured.length > 0 && (
          <div className="mb-10">
            <motion.p
              className="font-gaming text-xs uppercase tracking-[0.3em] text-neon-magenta/60 mb-6"
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 }}
            >★ Legendary Items</motion.p>
            <motion.div
              className="grid gap-6 md:grid-cols-2"
              variants={staggerContainer(0.15, 0.3)}
              initial="hidden" animate={inView ? "visible" : "hidden"}
            >
              {featured.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} inView={inView} />
              ))}
            </motion.div>
          </div>
        )}

        {others.length > 0 && (
          <div>
            <motion.p
              className="font-gaming text-xs uppercase tracking-[0.3em] text-slate-600 mb-6"
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
            >◆ Inventory</motion.p>
            <motion.div
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer(0.1, 0.5)}
              initial="hidden" animate={inView ? "visible" : "hidden"}
            >
              {others.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={featured.length + i} inView={inView} />
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
