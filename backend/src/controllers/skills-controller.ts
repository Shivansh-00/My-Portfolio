import type { Request, Response } from "express";
import { loadSkills } from "../services/skills-service";

export async function getSkills(_req: Request, res: Response) {
  const skills = await loadSkills();
  res.json(skills);
}
