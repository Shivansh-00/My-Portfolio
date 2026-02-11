"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSfx } from "@/lib/use-sfx";

const navItems = [
  { label: "HOME", href: "#hero", icon: "◆" },
  { label: "STATS", href: "#stats", icon: "◈" },
  { label: "SKILLS", href: "#skills", icon: "⬡" },
  { label: "QUESTS", href: "#experience", icon: "⚔" },
  { label: "ARSENAL", href: "#projects", icon: "⬢" },
  { label: "GAME", href: "#game", icon: "🎮" },
  { label: "CONTACT", href: "#contact", icon: "◇" },
];

export default function GamingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const sfx = useSfx();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = navItems.map((item) =>
        document.querySelector(item.href)
      );
      const scrollPos = window.scrollY + window.innerHeight / 3;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && (section as HTMLElement).offsetTop <= scrollPos) {
          setActiveSection(navItems[i].href.slice(1));
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    sfx.play("click");
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Desktop Sidebar Nav */}
      <nav
        className={`fixed left-0 top-0 z-40 hidden h-full w-16 flex-col items-center justify-center gap-1 lg:flex
          ${scrolled ? "bg-gaming-dark/80 backdrop-blur-md" : "bg-transparent"}
          transition-all duration-500`}
      >
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="w-8 h-8 border border-neon-cyan/40 rotate-45 flex items-center justify-center">
            <span className="font-gaming text-[10px] neon-text-cyan -rotate-45">
              SS
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              {...sfx.hover}
              className={`group relative flex flex-col items-center justify-center w-10 h-10
                          transition-all duration-300 ${
                            activeSection === item.href.slice(1)
                              ? "text-neon-cyan"
                              : "text-slate-600 hover:text-slate-300"
                          }`}
            >
              <span className="text-lg">{item.icon}</span>
              {activeSection === item.href.slice(1) && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -right-[1px] h-6 w-[2px] bg-neon-cyan"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  style={{
                    boxShadow: "0 0 8px rgba(0,240,255,0.6)",
                  }}
                />
              )}
              {/* Tooltip */}
              <div
                className="absolute left-14 px-3 py-1.5 bg-gaming-card border border-gaming-border
                            font-gaming text-[10px] tracking-widest whitespace-nowrap
                            opacity-0 group-hover:opacity-100 transition-all duration-200
                            pointer-events-none"
              >
                <span className="text-neon-cyan">{item.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom decorative line */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-12 w-[1px] bg-gradient-to-b from-neon-cyan/30 to-transparent" />
      </nav>

      {/* Mobile Top Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 lg:hidden
          ${scrolled ? "bg-gaming-dark/90 backdrop-blur-md border-b border-gaming-border" : "bg-transparent"}
          transition-all duration-500`}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 border border-neon-cyan/40 rotate-45 flex items-center justify-center">
            <span className="font-gaming text-[9px] neon-text-cyan -rotate-45">
              SS
            </span>
          </div>
          <span className="font-gaming text-xs tracking-widest text-slate-400">
            PORTFOLIO
          </span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
        >
          <motion.span
            animate={isOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
            className="block w-5 h-[1px] bg-neon-cyan origin-center"
          />
          <motion.span
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-5 h-[1px] bg-neon-cyan"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
            className="block w-5 h-[1px] bg-neon-cyan origin-center"
          />
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 bg-gaming-dark/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6 lg:hidden"
          >
            {navItems.map((item, i) => (
              <motion.button
                key={item.href}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleNavClick(item.href)}
                className={`font-gaming text-lg tracking-[0.3em] uppercase transition-colors duration-300 flex items-center gap-4
                  ${activeSection === item.href.slice(1) ? "neon-text-cyan" : "text-slate-500 hover:text-slate-200"}`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
