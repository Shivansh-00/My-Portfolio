import HeroSection from "@/components/hero-section";
import StatsSection from "@/components/stats-section";
import SkillsSection from "@/components/skills-section";
import ExperienceSection from "@/components/experience-section";
import ProjectsSection from "@/components/projects-section";
import ContactSection from "@/components/contact-section";
import CyberGame from "@/components/cyber-game";
import BreachGateway from "@/components/breach-gateway";
import GamingShell from "@/components/gaming-shell";
import {
  staticProfile,
  staticSkills,
  staticExperience,
  staticProjects,
  staticGithub,
  staticLeetcode,
} from "@/lib/static-data";
import { fetchGitHubStats, fetchLeetCodeStats } from "@/lib/fetch-stats";

/* ISR — revalidate the page every 5 minutes so stats stay fresh */
export const revalidate = 300;

function SectionDivider({ variant = "cyan" }: { variant?: "cyan" | "magenta" | "green" | "multi" }) {
  const gradients: Record<string, string> = {
    cyan: "from-transparent via-neon-cyan/30 to-transparent",
    magenta: "from-transparent via-neon-magenta/30 to-transparent",
    green: "from-transparent via-neon-green/30 to-transparent",
    multi: "",
  };
  return (
    <div className="relative py-6 lg:pl-20">
      <div className="max-w-6xl mx-auto px-4">
        {variant === "multi" ? (
          <div className="cyber-divider" />
        ) : (
          <div className="relative">
            <div className={`h-px bg-gradient-to-r ${gradients[variant]}`} />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border"
              style={{
                borderColor:
                  variant === "cyan" ? "rgba(212,168,83,0.4)" :
                  variant === "magenta" ? "rgba(136,150,168,0.4)" :
                  "rgba(57,255,20,0.4)",
                boxShadow:
                  variant === "cyan" ? "0 0 8px rgba(212,168,83,0.3)" :
                  variant === "magenta" ? "0 0 8px rgba(136,150,168,0.3)" :
                  "0 0 8px rgba(57,255,20,0.3)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default async function HomePage() {
  /* Fetch both data sources in parallel at the server.
     If either fails, fall back to static zeros. */
  const [ghResult, lcResult] = await Promise.allSettled([
    fetchGitHubStats(),
    fetchLeetCodeStats(),
  ]);

  const github =
    ghResult.status === "fulfilled" && ghResult.value.topRepos.length > 0
      ? ghResult.value
      : staticGithub;

  const leetcode =
    lcResult.status === "fulfilled" && lcResult.value.totalSolved > 0
      ? lcResult.value
      : staticLeetcode;

  return (
    <GamingShell>
      <HeroSection profile={staticProfile} />
      <SectionDivider variant="cyan" />
      <StatsSection github={github} leetcode={leetcode} />
      <SectionDivider variant="magenta" />
      <SkillsSection skills={staticSkills} />
      <SectionDivider variant="green" />
      <ExperienceSection experience={staticExperience} />
      <SectionDivider variant="cyan" />
      <BreachGateway>
        <ProjectsSection projects={staticProjects} />
      </BreachGateway>
      <SectionDivider variant="multi" />
      <CyberGame />
      <SectionDivider variant="magenta" />
      <ContactSection profile={staticProfile} />
    </GamingShell>
  );
}
