import { listProjects, updateProject } from "../repositories/projects-repository";

export async function loadProjects() {
  try {
    const items = await listProjects();
    return items.map((item) => ({
      ...item,
      tags: typeof item.tags === "string" ? JSON.parse(item.tags) : item.tags
    }));
  } catch (error) {
    return [];
  }
}

export async function editProject(
  id: string,
  data: Partial<{ description: string; featured: boolean; isVisible: boolean }>
) {
  return updateProject(id, data);
}
