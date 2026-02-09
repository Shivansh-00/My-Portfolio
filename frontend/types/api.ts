export interface Profile {
  name: string;
  role: string;
  email: string;
  linkedin: string;
  github: string;
  leetcode: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export interface ExperienceItem {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
  highlights: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tags: string[];
  featured: boolean;
  repoUrl?: string;
  liveUrl?: string;
}

export interface GitHubStats {
  topRepos: { name: string; url: string; stars: number }[];
  languages: { name: string; percentage: number }[];
  recentCommits: number;
}

export interface LeetCodeStats {
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
}
