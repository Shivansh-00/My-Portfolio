import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const jwtSecret = process.env.JWT_SECRET ?? "";

const projectUpdateSchema = z.object({
  description: z.string().optional(),
  featured: z.boolean().optional(),
  isVisible: z.boolean().optional(),
});

function verifyAuth(request: NextRequest): { email: string } | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !jwtSecret) return null;

  const token = authHeader.replace("Bearer ", "");
  try {
    return jwt.verify(token, jwtSecret) as { email: string };
  } catch {
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = projectUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { id } = await params;
    const project = await prisma.project.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(project);
  } catch {
    return NextResponse.json(
      { error: "Project not found" },
      { status: 404 }
    );
  }
}
