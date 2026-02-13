"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useSfx } from "@/lib/use-sfx";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  message: z.string().min(10, "Message too short"),
  company: z.string().optional() // honeypot
});

type FormValues = z.infer<typeof schema>;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const sfx = useSfx();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    if (values.company) return;

    try {
      setStatus("sending");
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (!res.ok) throw new Error("Request failed");

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

      {/* Name field */}
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-slate-600 mb-2 block">
          Player_Name
        </label>
        <input
          className="gaming-input"
          placeholder="Enter your name..."
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1 font-mono text-xs text-neon-red">{errors.name.message}</p>
        )}
      </div>

      {/* Email field */}
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-slate-600 mb-2 block">
          Comms_Channel
        </label>
        <input
          className="gaming-input"
          placeholder="your@email.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 font-mono text-xs text-neon-red">{errors.email.message}</p>
        )}
      </div>

      {/* Message field */}
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-slate-600 mb-2 block">
          Transmission
        </label>
        <textarea
          rows={5}
          className="gaming-input resize-none"
          placeholder="Type your message..."
          {...register("message")}
        />
        {errors.message && (
          <p className="mt-1 font-mono text-xs text-neon-red">{errors.message.message}</p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="gaming-btn w-full"
        disabled={status === "sending"}
      >
        {status === "sending" ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              ◈
            </motion.span>
            Transmitting...
          </span>
        ) : (
          "◇ Send Transmission"
        )}
      </button>

      {/* Status messages */}
      <AnimatePresence>
        {status === "sent" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 border border-neon-green/30 bg-neon-green/5"
          >
            <p className="font-mono text-xs neon-text-green flex items-center gap-2">
              <span>✓</span> TRANSMISSION SUCCESSFUL — MESSAGE DELIVERED
            </p>
          </motion.div>
        )}
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
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
