import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Experience } from "@prisma/client";

export async function GET() {
  try {
    const items: Experience[] = await prisma.experience.findMany({
      orderBy: { startDate: "desc" },
    });
    const mapped = items.map((item: Experience) => ({
      ...item,
      highlights:
        typeof item.highlights === "string"
          ? JSON.parse(item.highlights)
          : item.highlights,
    }));
    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json([]);
  }
}
