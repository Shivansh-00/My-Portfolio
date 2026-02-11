"use client";

import type { Profile } from "@/types/api";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import ContactForm from "@/components/contact-form";

export default function ContactSection({ profile }: { profile: Profile }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="contact" ref={ref} className="gaming-section py-20 lg:pl-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-heading mb-4"
        >
          Open Comms
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-mono text-xs text-slate-500 mb-12"
        >
          {">"} COMMS_CHANNEL.open() — READY TO RECEIVE TRANSMISSIONS
        </motion.p>

        <div className="grid gap-8 md:grid-cols-5">
          {/* Contact Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-2"
          >
            <div className="gaming-card h-full">
              <div className="hud-corner hud-corner-tl" />
              <div className="hud-corner hud-corner-br" />

              <h3 className="font-gaming text-sm uppercase tracking-widest neon-text-cyan mb-6">
                Direct Links
              </h3>

              <div className="space-y-5">
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 border border-gaming-border flex items-center justify-center
                               group-hover:border-neon-cyan/60 transition-all duration-300">
                    <span className="text-sm">✉</span>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-slate-600 uppercase">
                      Email
                    </p>
                    <p className="font-body text-sm text-slate-400 group-hover:text-neon-cyan transition-colors">
                      {profile.email}
                    </p>
                  </div>
                </a>

                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 border border-gaming-border flex items-center justify-center
                               group-hover:border-neon-cyan/60 transition-all duration-300">
                    <span className="text-sm">⬡</span>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-slate-600 uppercase">
                      GitHub
                    </p>
                    <p className="font-body text-sm text-slate-400 group-hover:text-neon-cyan transition-colors">
                      Shivansh-00
                    </p>
                  </div>
                </a>

                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 border border-gaming-border flex items-center justify-center
                               group-hover:border-neon-magenta/60 transition-all duration-300">
                    <span className="text-sm">◆</span>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-slate-600 uppercase">
                      LinkedIn
                    </p>
                    <p className="font-body text-sm text-slate-400 group-hover:text-neon-magenta transition-colors">
                      Shivansh Srivastava
                    </p>
                  </div>
                </a>

                <a
                  href={profile.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 border border-gaming-border flex items-center justify-center
                               group-hover:border-neon-green/60 transition-all duration-300">
                    <span className="text-sm">◈</span>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-slate-600 uppercase">
                      LeetCode
                    </p>
                    <p className="font-body text-sm text-slate-400 group-hover:text-neon-green transition-colors">
                      Profile
                    </p>
                  </div>
                </a>
              </div>

              {/* Decorative status */}
              <div className="mt-8 pt-4 border-t border-gaming-border">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                  <span className="font-mono text-[10px] text-slate-600">
                    COMMS_STATUS: ONLINE
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="md:col-span-3"
          >
            <div className="gaming-card">
              <div className="hud-corner hud-corner-tl" />
              <div className="hud-corner hud-corner-tr" />
              <div className="hud-corner hud-corner-bl" />
              <div className="hud-corner hud-corner-br" />

              <h3 className="font-gaming text-sm uppercase tracking-widest neon-text-cyan mb-6">
                Send Transmission
              </h3>
              <ContactForm />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
