import type { Request, Response } from "express";
import { loadExperience } from "../services/experience-service";

export async function getExperience(_req: Request, res: Response) {
  const experience = await loadExperience();
  res.json(experience);
}
