import prisma from "../lib/prisma";

export async function createContactMessage(data: {
  name: string;
  email: string;
  message: string;
}) {
  return prisma.contactMessage.create({ data });
}

export async function listContactMessages() {
  return prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
}
