"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useSfx } from "@/lib/use-sfx";

const navItems = [
  { label: "HOME", href: "#hero", icon: "◆" },
  { label: "STATS", href: "#stats", icon: "◈" },
  { label: "SKILLS", href: "#skills", icon: "⬡" },
  { label: "MISSIONS", href: "#experience", icon: "⚔" },
  { label: "PROJECTS", href: "#projects", icon: "⬢" },
  { label: "GAME", href: "#game", icon: "🎮" },
  { label: "CONTACT", href: "#contact", icon: "✉" },
];

export default function GamingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const sfx = useSfx();
  const { scrollYProgress } = useScroll();
  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
        const scrollPos = window.scrollY + window.innerHeight / 3;
        for (let i = navItems.length - 1; i >= 0; i--) {
          const el = document.querySelector(navItems[i].href);
          if (el && (el as HTMLElement).offsetTop <= scrollPos) {
            setActiveSection(navItems[i].href.slice(1));
            break;
          }
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = useCallback((href: string) => {
    sfx.play("navigate");
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [sfx]);

  return (
    <>
      {/* Desktop Sidebar */}
      <nav
        className={`fixed left-0 top-0 z-40 hidden h-full w-16 flex-col items-center justify-center gap-1 lg:flex
          ${scrolled ? "bg-gaming-dark/80 backdrop-blur-md" : "bg-transparent"}
          transition-all duration-500`}
      >
        <motion.div
          className="absolute top-4 left-1/2 -translate-x-1/2"
          whileHover={{ scale: 1.15, rotate: 90 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <div className="w-8 h-8 border border-neon-cyan/40 rotate-45 flex items-center justify-center cursor-pointer">
            <span className="font-gaming text-[10px] neon-text-cyan -rotate-45">SS</span>
          </div>
        </motion.div>

        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = activeSection === item.href.slice(1);
            return (
              <motion.button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                {...sfx.hover}
                whileHover={{ scale: 1.15, x: 3 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`group relative flex flex-col items-center justify-center w-10 h-10
                            transition-all duration-300 ${
                              isActive ? "text-neon-cyan" : "text-slate-600 hover:text-slate-300"
                            }`}
              >
                <span className="text-lg">{item.icon}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -right-[1px] h-6 w-[2px] bg-neon-cyan"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{ boxShadow: "0 0 8px rgba(220,20,60,0.6)" }}
                  />
                )}
                <div className="absolute left-14 px-3 py-1.5 bg-gaming-card border border-gaming-border
                                font-gaming text-[10px] tracking-widest whitespace-nowrap
                                opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                  <span className="text-neon-cyan">{item.label}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          {/* Scroll progress bar */}
          <div className="relative h-16 w-[2px] bg-gaming-border/40 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-full rounded-full"
              style={{
                height: progressHeight,
                background: "linear-gradient(to bottom, #DC143C, #a855f7, #1E90FF)",
                boxShadow: "0 0 6px rgba(220,20,60,0.5)",
              }}
            />
          </div>
          <span className="font-mono text-[8px] text-slate-700">
            {navItems.findIndex((item) => activeSection === item.href.slice(1)) + 1}/{navItems.length}
          </span>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 lg:hidden
          ${scrolled ? "bg-gaming-dark/90 backdrop-blur-md border-b border-gaming-border" : "bg-transparent"}
          transition-all duration-500`}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 border border-neon-cyan/40 rotate-45 flex items-center justify-center">
            <span className="font-gaming text-[9px] neon-text-cyan -rotate-45">SS</span>
          </div>
          <span className="font-gaming text-xs tracking-widest text-slate-400">PORTFOLIO</span>
        </div>

        <motion.button
          onClick={() => { sfx.play("toggle"); setIsOpen(!isOpen); }}
          whileTap={{ scale: 0.9 }}
          className="relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
        >
          <motion.span animate={isOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
            className="block w-5 h-[1px] bg-neon-cyan origin-center" />
          <motion.span animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            className="block w-5 h-[1px] bg-neon-cyan" />
          <motion.span animate={isOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
            className="block w-5 h-[1px] bg-neon-cyan origin-center" />
        </motion.button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 bg-gaming-dark/95 flex flex-col items-center justify-center gap-6 lg:hidden"
          >
            {navItems.map((item, i) => (
              <motion.button
                key={item.href}
                initial={{ opacity: 0, x: -40, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => handleNavClick(item.href)}
                whileHover={{ x: 8, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`font-gaming text-lg tracking-[0.3em] uppercase transition-colors duration-300 flex items-center gap-4
                  ${activeSection === item.href.slice(1) ? "neon-text-cyan" : "text-slate-500 hover:text-slate-200"}`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
                {activeSection === item.href.slice(1) && (
                  <motion.span
                    layoutId="mobile-indicator"
                    className="w-1.5 h-1.5 bg-neon-cyan rounded-full ml-2"
                    style={{ boxShadow: "0 0 8px rgba(220,20,60,0.8)" }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
