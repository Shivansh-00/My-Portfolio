import type { Request, Response } from "express";
import { loadProjects } from "../services/projects-service";

export async function getProjects(_req: Request, res: Response) {
  const projects = await loadProjects();
  res.json(projects);
}
