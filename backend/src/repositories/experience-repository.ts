import prisma from "../lib/prisma";

export async function listExperience() {
  return prisma.experience.findMany({ orderBy: { startDate: "desc" } });
}
