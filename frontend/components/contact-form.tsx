"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import emailjs from "emailjs-com";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  message: z.string().min(10, "Message too short"),
  company: z.string().optional() // honeypot
});

type FormValues = z.infer<typeof schema>;

const EMAIL_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "";
const EMAIL_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
const EMAIL_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    if (values.company) {
      return;
    }

    try {
      setStatus("sending");
      await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (EMAIL_SERVICE_ID && EMAIL_TEMPLATE_ID && EMAIL_PUBLIC_KEY) {
        await emailjs.send(
          EMAIL_SERVICE_ID,
          EMAIL_TEMPLATE_ID,
          {
            from_name: values.name,
            reply_to: values.email,
            message: values.message
          },
          EMAIL_PUBLIC_KEY
        );
      }

      setStatus("sent");
      reset();
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <input type="text" className="hidden" tabIndex={-1} {...register("company")} />
      <div>
        <label className="text-sm text-slate-400">Name</label>
        <input
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2"
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="text-sm text-slate-400">Email</label>
        <input
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label className="text-sm text-slate-400">Message</label>
        <textarea
          rows={4}
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2"
          {...register("message")}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>
        )}
      </div>
      <button
        type="submit"
        className="rounded-full bg-brand-500 px-6 py-2 text-sm font-semibold text-white"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending..." : "Send message"}
      </button>
      {status === "sent" && (
        <p className="text-sm text-emerald-400">Message sent successfully.</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-400">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
