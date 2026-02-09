import { listExperience } from "../repositories/experience-repository";

export async function loadExperience() {
  try {
    const items = await listExperience();
    return items.map((item) => ({
      ...item,
      highlights: typeof item.highlights === "string" ? JSON.parse(item.highlights) : item.highlights
    }));
  } catch (error) {
    return [];
  }
}
