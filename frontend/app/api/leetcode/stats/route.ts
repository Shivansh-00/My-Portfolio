import { NextResponse } from "next/server";
import { staticLeetcode } from "@/lib/static-data";

const LEETCODE_USERNAME = "YjPHT2lSCY";

/* ── Server-side response cache ── */
let cachedResponse: { data: Record<string, unknown>; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export async function GET() {
  if (cachedResponse && Date.now() - cachedResponse.ts < CACHE_TTL) {
    return NextResponse.json(cachedResponse.data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  }

  const apis = [
    `https://leetcode-stats-api.herokuapp.com/${LEETCODE_USERNAME}`,
    `https://alfa-leetcode-api.onrender.com/${LEETCODE_USERNAME}/solved`,
  ];

  for (const url of apis) {
    try {
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) continue;
      const data = await res.json();

      if (data.totalSolved !== undefined) {
        const result = {
          totalSolved: data.totalSolved ?? 0,
          easy: data.easySolved ?? 0,
          medium: data.mediumSolved ?? 0,
          hard: data.hardSolved ?? 0,
        };
        cachedResponse = { data: result, ts: Date.now() };
        return NextResponse.json(result, {
          headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
        });
      }

      if (data.solvedProblem !== undefined) {
        const result = {
          totalSolved: data.solvedProblem ?? 0,
          easy: data.easySolved ?? 0,
          medium: data.mediumSolved ?? 0,
          hard: data.hardSolved ?? 0,
        };
        cachedResponse = { data: result, ts: Date.now() };
        return NextResponse.json(result, {
          headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
        });
      }
    } catch {
      continue;
    }
  }

  // Return stale cache if available
  if (cachedResponse) {
    return NextResponse.json(cachedResponse.data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" },
    });
  }

  return NextResponse.json(staticLeetcode);
}
