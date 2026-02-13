"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useSfx } from "@/lib/use-sfx";
import emailjs from "emailjs-com";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  message: z.string().min(10, "Message too short"),
  company: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

/* ── EmailJS — client-side email delivery ──
   Configure these in .env.local (see .env.example)          */
const EMAILJS_SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  ?? "";
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
const EMAILJS_PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  ?? "";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const sfx = useSfx();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    if (values.company) return; // honeypot
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error("EmailJS is not configured. Set NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, and NEXT_PUBLIC_EMAILJS_PUBLIC_KEY.");
      setStatus("error");
      sfx.play("error");
      return;
    }
    try {
      setStatus("sending");
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: values.name,
          from_email: values.email,
          message: values.message,
          to_name: "Shivansh",
        },
        EMAILJS_PUBLIC_KEY
      );
      setStatus("sent");
      sfx.play("success");
      reset();
    } catch (error) {
      console.error(error);
      setStatus("error");
      sfx.play("error");
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <input type="text" className="hidden" tabIndex={-1} {...register("company")} />

      {[
        { name: "name" as const, label: "Player_Name", placeholder: "Enter your name..." },
        { name: "email" as const, label: "Comms_Channel", placeholder: "your@email.com" },
      ].map((field, i) => (
        <motion.div
          key={field.name}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <label className="font-mono text-[10px] uppercase tracking-widest text-slate-600 mb-2 block">{field.label}</label>
          <input
            className="gaming-input"
            placeholder={field.placeholder}
            {...register(field.name)}
          />
          <AnimatePresence>
            {errors[field.name] && (
              <motion.p
                initial={{ opacity: 0, y: -5, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -5, height: 0 }}
                className="mt-1 font-mono text-xs text-neon-red"
              >{errors[field.name]?.message}</motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <label className="font-mono text-[10px] uppercase tracking-widest text-slate-600 mb-2 block">Transmission</label>
        <textarea
          rows={5}
          className="gaming-input resize-none"
          placeholder="Type your message..."
          {...register("message")}
        />
        <AnimatePresence>
          {errors.message && (
            <motion.p
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              className="mt-1 font-mono text-xs text-neon-red"
            >{errors.message.message}</motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.button
        type="submit"
        className="gaming-btn w-full"
        disabled={status === "sending"}
        whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(220,20,60,0.3)" }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {status === "sending" ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="inline-block">◈</motion.span>
            Transmitting...
          </span>
        ) : "◇ Send Transmission"}
      </motion.button>

      <AnimatePresence mode="wait">
        {status === "sent" && (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-3 border border-neon-green/30 bg-neon-green/5"
          >
            <p className="font-mono text-xs neon-text-green flex items-center gap-2">
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5 }}>✓</motion.span>
              TRANSMISSION SUCCESSFUL — MESSAGE DELIVERED
            </p>
          </motion.div>
        )}
        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: [0, -4, 4, -4, 4, 0] }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-3 border border-neon-red/30 bg-neon-red/5"
          >
            <p className="font-mono text-xs text-neon-red flex items-center gap-2">
              <span>✗</span> TRANSMISSION FAILED — RETRY RECOMMENDED
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
