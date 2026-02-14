import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const jwtSecret = process.env.JWT_SECRET ?? "";

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

export async function GET(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contacts = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(contacts);
  } catch {
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 }
    );
  }
}
