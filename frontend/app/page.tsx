import { api } from "@/lib/api";
import HeroSection from "@/components/hero-section";
import StatsSection from "@/components/stats-section";
import SkillsSection from "@/components/skills-section";
import ExperienceSection from "@/components/experience-section";
import ProjectsSection from "@/components/projects-section";
import ContactSection from "@/components/contact-section";
import GamingShell from "@/components/gaming-shell";

export default async function HomePage() {
  const fallbackProfile = {
    name: "Shivansh Srivastava",
    role: "AI Engineer | Full-Stack Developer | AIR 15 SRMJEEE",
    email: "shivanshsrivastava495@gmail.com",
    linkedin: "https://www.linkedin.com/in/shivansh-srivastava-3a2a161b5/",
    github: "https://github.com/Shivansh-00",
    leetcode: "https://leetcode.com/u/YjPHT2lSCY/"
  };

  const [profile, skills, experience, projects, github, leetcode] =
    await Promise.all([
      api.profile().catch(() => fallbackProfile),
      api.skills().catch(() => []),
      api.experience().catch(() => []),
      api.projects().catch(() => []),
      api.github().catch(() => ({
        topRepos: [],
        languages: [],
        recentCommits: 0
      })),
      api.leetcode().catch(() => ({
        totalSolved: 0,
        easy: 0,
        medium: 0,
        hard: 0
      }))
    ]);

  return (
    <GamingShell>
      <HeroSection profile={profile} />

      {/* Divider */}
      <div className="relative py-4 lg:pl-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />
        </div>
      </div>

      <StatsSection github={github} leetcode={leetcode} />

      <div className="relative py-4 lg:pl-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-neon-magenta/20 to-transparent" />
        </div>
      </div>

      <SkillsSection skills={skills} />

      <div className="relative py-4 lg:pl-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-neon-green/20 to-transparent" />
        </div>
      </div>

      <ExperienceSection experience={experience} />

      <div className="relative py-4 lg:pl-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />
        </div>
      </div>

      <ProjectsSection projects={projects} />

      <div className="relative py-4 lg:pl-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-neon-magenta/20 to-transparent" />
        </div>
      </div>

      <ContactSection profile={profile} />
    </GamingShell>
  );
}
