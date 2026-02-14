import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_PROFILE = {
  id: "default",
  name: "Shivansh Srivastava",
  role: "AI Engineer | Full-Stack Developer | AIR 15 SRMJEEE",
  email: "shivanshsrivastava495@gmail.com",
  linkedin: "https://www.linkedin.com/in/shivansh-srivastava-3a2a161b5/",
  github: "https://github.com/Shivansh-00",
  leetcode: "https://leetcode.com/u/YjPHT2lSCY/",
};

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    return NextResponse.json(profile ?? DEFAULT_PROFILE);
  } catch {
    return NextResponse.json(DEFAULT_PROFILE);
  }
}
