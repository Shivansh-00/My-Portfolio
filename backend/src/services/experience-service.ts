import { listExperience } from "../repositories/experience-repository";

export async function loadExperience() {
  try {
    return await listExperience();
  } catch (error) {
    return [];
  }
}
