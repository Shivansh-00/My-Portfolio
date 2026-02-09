import type { Request, Response } from "express";
import { loadLeetCodeStats } from "../services/leetcode-service";
import { loadProfile } from "../services/profile-service";

export async function getLeetCodeStats(_req: Request, res: Response) {
  const profile = await loadProfile();
  const stats = await loadLeetCodeStats(profile.leetcode);
  res.json(stats);
}
