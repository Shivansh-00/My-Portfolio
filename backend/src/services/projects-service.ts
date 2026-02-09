import { listProjects, updateProject } from "../repositories/projects-repository";

export async function loadProjects() {
  try {
    return await listProjects();
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
