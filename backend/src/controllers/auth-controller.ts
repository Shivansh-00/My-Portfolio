import type { Request, Response } from "express";
import { z } from "zod";
import { login } from "../services/auth-service";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function loginHandler(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const token = await login(parsed.data.email, parsed.data.password);
  if (!token) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  return res.json({ token });
}
