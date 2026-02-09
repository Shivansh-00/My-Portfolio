import type { Request, Response } from "express";
import { z } from "zod";
import { submitContactMessage } from "../services/contact-service";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10)
});

export async function createContact(req: Request, res: Response) {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  try {
    const message = await submitContactMessage(parsed.data);
    return res.status(201).json(message);
  } catch (error) {
    return res.status(503).json({ error: "Service unavailable" });
  }
}
