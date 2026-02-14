import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.skillCategory.findMany({
      include: { skills: true },
      orderBy: { name: "asc" },
    });
    const mapped = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      skills: cat.skills.map((s) => s.name),
    }));
    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json([]);
  }
}
