import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const jwtSecret = process.env.JWT_SECRET ?? "";
const adminEmail = process.env.ADMIN_EMAIL ?? "";
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH ?? "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (!adminEmail || !adminPasswordHash || !jwtSecret) {
      return NextResponse.json(
        { error: "Admin credentials not configured" },
        { status: 500 }
      );
    }

    if (parsed.data.email !== adminEmail) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(
      parsed.data.password,
      adminPasswordHash
    );
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign({ email: parsed.data.email }, jwtSecret, {
      expiresIn: "8h",
    });

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
