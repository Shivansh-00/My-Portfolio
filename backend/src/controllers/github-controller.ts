import type { Request, Response } from "express";
import { loadGitHubStats } from "../services/github-service";
import { loadProfile } from "../services/profile-service";

export async function getGitHubStats(_req: Request, res: Response) {
  const profile = await loadProfile();
  const stats = await loadGitHubStats(profile.github);
  res.json(stats);
}
