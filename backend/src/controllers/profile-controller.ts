import type { Request, Response } from "express";
import { loadProfile } from "../services/profile-service";

export async function getProfile(_req: Request, res: Response) {
  const profile = await loadProfile();
  res.json(profile);
}
