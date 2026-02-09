import type { Request, Response } from "express";
import { z } from "zod";
import { loadContactMessages } from "../services/contact-service";
import { editProject } from "../services/projects-service";

const projectUpdateSchema = z.object({
  description: z.string().optional(),
  featured: z.boolean().optional(),
  isVisible: z.boolean().optional()
});

export async function getContacts(_req: Request, res: Response) {
  try {
    const contacts = await loadContactMessages();
    res.json(contacts);
  } catch (error) {
    res.status(503).json({ error: "Service unavailable" });
  }
}

export async function updateProject(req: Request, res: Response) {
  const parsed = projectUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const project = await editProject(req.params.id, parsed.data);
  res.json(project);
}
