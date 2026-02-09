import prisma from "../lib/prisma";

export async function listProjects() {
  return prisma.project.findMany({
    where: { isVisible: true },
    orderBy: [{ featured: "desc" }, { name: "asc" }]
  });
}

export async function updateProject(
  id: string,
  data: Partial<{ description: string; featured: boolean; isVisible: boolean }>
) {
  return prisma.project.update({ where: { id }, data });
}
