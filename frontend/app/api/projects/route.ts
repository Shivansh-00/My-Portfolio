import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Project } from "@prisma/client";

export async function GET() {
  try {
    const items: Project[] = await prisma.project.findMany({
      where: { isVisible: true },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });
    const mapped = items.map((item: Project) => ({
      ...item,
      tags:
        typeof item.tags === "string" ? JSON.parse(item.tags) : item.tags,
    }));
    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json([]);
  }
}
