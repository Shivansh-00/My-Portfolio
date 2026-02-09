import { api } from "@/lib/api";
import HeroSection from "@/components/hero-section";
import StatsSection from "@/components/stats-section";
import SkillsSection from "@/components/skills-section";
import ExperienceSection from "@/components/experience-section";
import ProjectsSection from "@/components/projects-section";
import ContactSection from "@/components/contact-section";

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
    <main className="space-y-16 px-6 py-10 md:px-16">
      <HeroSection profile={profile} />
      <StatsSection github={github} leetcode={leetcode} />
      <SkillsSection skills={skills} />
      <ExperienceSection experience={experience} />
      <ProjectsSection projects={projects} />
      <ContactSection profile={profile} />
    </main>
  );
}
