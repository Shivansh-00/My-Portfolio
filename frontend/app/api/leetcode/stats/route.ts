import { NextResponse } from "next/server";

const LEETCODE_USERNAME = "YjPHT2lSCY";

export async function GET() {
  const apis = [
    `https://leetcode-stats-api.herokuapp.com/${LEETCODE_USERNAME}`,
    `https://alfa-leetcode-api.onrender.com/${LEETCODE_USERNAME}/solved`,
  ];

  for (const url of apis) {
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) continue;
      const data = await res.json();

      if (data.totalSolved !== undefined) {
        return NextResponse.json({
          totalSolved: data.totalSolved ?? 0,
          easy: data.easySolved ?? 0,
          medium: data.mediumSolved ?? 0,
          hard: data.hardSolved ?? 0,
        });
      }

      if (data.solvedProblem !== undefined) {
        return NextResponse.json({
          totalSolved: data.solvedProblem ?? 0,
          easy: data.easySolved ?? 0,
          medium: data.mediumSolved ?? 0,
          hard: data.hardSolved ?? 0,
        });
      }
    } catch {
      continue;
    }
  }

  return NextResponse.json({
    totalSolved: 0,
    easy: 0,
    medium: 0,
    hard: 0,
  });
}
