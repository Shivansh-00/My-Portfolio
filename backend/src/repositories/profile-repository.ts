import prisma from "../lib/prisma";

export async function getProfile() {
  return prisma.profile.findFirst();
}
