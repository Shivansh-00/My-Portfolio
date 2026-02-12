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

export default function HomePage() {
  return (
    <GamingShell>
      <HeroSection profile={staticProfile} />

      {/* Divider */}
      <div className="relative py-4 lg:pl-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />
        </div>
      </div>

      <StatsSection github={staticGithub} leetcode={staticLeetcode} />

      <div className="relative py-4 lg:pl-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-neon-magenta/20 to-transparent" />
        </div>
      </div>

      <SkillsSection skills={staticSkills} />

      <div className="relative py-4 lg:pl-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-neon-green/20 to-transparent" />
        </div>
      </div>

      <ExperienceSection experience={staticExperience} />

      <div className="relative py-4 lg:pl-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />
        </div>
      </div>

      <BreachGateway>
        <ProjectsSection projects={staticProjects} />
      </BreachGateway>

      <div className="relative py-4 lg:pl-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="cyber-divider" />
        </div>
      </div>

      <CyberGame />

      <div className="relative py-4 lg:pl-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-neon-magenta/20 to-transparent" />
        </div>
      </div>

      <ContactSection profile={staticProfile} />
    </GamingShell>
  );
}
