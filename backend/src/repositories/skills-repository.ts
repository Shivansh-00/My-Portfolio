import prisma from "../lib/prisma";

export async function listSkillCategories() {
  return prisma.skillCategory.findMany({
    include: { skills: true },
    orderBy: { name: "asc" }
  });
}
