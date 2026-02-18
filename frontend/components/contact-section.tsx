"use client";

import type { Profile } from "@/types/api";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import ContactForm from "@/components/contact-form";
import { headingReveal, fadeInLeft, fadeInRight, staggerContainer, staggerItem } from "@/lib/animations";

export default function ContactSection({ profile }: { profile: Profile }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="contact" ref={ref} className="gaming-section py-12 md:py-20 lg:pl-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h2
          variants={headingReveal} initial="hidden" animate={inView ? "visible" : "hidden"}
          className="section-heading mb-4"
        >Bat Signal</motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-mono text-xs text-slate-500 mb-12"
        >{">"}  BAT_SIGNAL.open() — READY TO RECEIVE TRANSMISSIONS</motion.p>

        <div className="grid gap-8 md:grid-cols-5">
          {/* Contact Info Panel */}
          <motion.div
            variants={fadeInLeft} initial="hidden" animate={inView ? "visible" : "hidden"}
            transition={{ delay: 0.3 }}
            className="md:col-span-2"
          >
            <div className="gaming-card h-full neon-pulse-border">
              <div className="hud-corner hud-corner-tl" />
              <div className="hud-corner hud-corner-br" />

              <h3 className="font-gaming text-sm uppercase tracking-widest neon-text-cyan mb-6">Direct Links</h3>

              <motion.div
                className="space-y-5"
                variants={staggerContainer(0.1, 0.5)}
                initial="hidden" animate={inView ? "visible" : "hidden"}
              >
                {[
                  { href: `mailto:${profile.email}`, icon: "✉", label: "Email", text: profile.email, color: "neon-cyan" },
                  { href: profile.github, icon: "⬡", label: "GitHub", text: "Shivansh-00", color: "neon-cyan" },
                  { href: profile.linkedin, icon: "◆", label: "LinkedIn", text: "Shivansh Srivastava", color: "neon-magenta" },
                  { href: profile.leetcode, icon: "◈", label: "LeetCode", text: "Profile", color: "neon-green" },
                ].map((link) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group"
                    variants={staggerItem}
                    whileHover={{ x: 6 }}
                  >
                    <motion.div
                      className="w-8 h-8 border border-gaming-border flex items-center justify-center transition-all duration-300"
                      style={{ borderColor: undefined }}
                      whileHover={{ rotate: 90, scale: 1.1, borderColor: link.color === "neon-cyan" ? "rgba(212,168,83,0.6)" : link.color === "neon-magenta" ? "rgba(136,150,168,0.6)" : "rgba(57,255,20,0.6)" }}
                    >
                      <span className="text-sm">{link.icon}</span>
                    </motion.div>
                    <div>
                      <p className="font-mono text-[10px] sm:text-[11px] text-slate-600 uppercase">{link.label}</p>
                      <p className="font-body text-xs sm:text-sm text-slate-400 group-hover:text-slate-200 transition-colors truncate max-w-[180px] sm:max-w-none">{link.text}</p>
                    </div>
                  </motion.a>
                ))}
              </motion.div>

              <div className="mt-8 pt-4 border-t border-gaming-border">
                <div className="flex items-center gap-2">
                  <motion.span
                    className="w-2 h-2 bg-neon-green rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="font-mono text-[10px] text-slate-600">BAT_STATUS: CONNECTED</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            variants={fadeInRight} initial="hidden" animate={inView ? "visible" : "hidden"}
            transition={{ delay: 0.5 }}
            className="md:col-span-3"
          >
            <div className="gaming-card neon-pulse-border">
              <div className="hud-corner hud-corner-tl" />
              <div className="hud-corner hud-corner-tr" />
              <div className="hud-corner hud-corner-bl" />
              <div className="hud-corner hud-corner-br" />
              <h3 className="font-gaming text-sm uppercase tracking-widest neon-text-cyan mb-6">Send Transmission</h3>
              <ContactForm />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
