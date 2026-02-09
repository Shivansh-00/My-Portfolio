export interface LeetCodeStats {
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
}

function getUsername(profileUrl: string) {
  const match = profileUrl.split("/").filter(Boolean);
  return match[match.length - 1];
}

export async function loadLeetCodeStats(profileUrl: string): Promise<LeetCodeStats> {
  const username = getUsername(profileUrl);

  try {
    const response = await fetch(
      `https://leetcode-stats-api.herokuapp.com/${username}`
    );
    if (!response.ok) {
      return { totalSolved: 0, easy: 0, medium: 0, hard: 0 };
    }
    const data = (await response.json()) as {
      totalSolved: number;
      easySolved: number;
      mediumSolved: number;
      hardSolved: number;
    };

    return {
      totalSolved: data.totalSolved ?? 0,
      easy: data.easySolved ?? 0,
      medium: data.mediumSolved ?? 0,
      hard: data.hardSolved ?? 0
    };
  } catch (error) {
    return { totalSolved: 0, easy: 0, medium: 0, hard: 0 };
  }
}
