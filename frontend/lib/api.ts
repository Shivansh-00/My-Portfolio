import type {
  ExperienceItem,
  GitHubStats,
  LeetCodeStats,
  Profile,
  Project,
  SkillCategory
} from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

export const api = {
  profile: () => fetchJson<Profile>("/api/profile"),
  skills: () => fetchJson<SkillCategory[]>("/api/skills"),
  experience: () => fetchJson<ExperienceItem[]>("/api/experience"),
  projects: () => fetchJson<Project[]>("/api/projects"),
  github: () => fetchJson<GitHubStats>("/api/github/stats"),
  leetcode: () => fetchJson<LeetCodeStats>("/api/leetcode/stats")
};
