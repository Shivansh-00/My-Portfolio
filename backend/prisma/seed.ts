import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.skill.deleteMany();
  await prisma.skillCategory.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.project.deleteMany();
  await prisma.profile.deleteMany();

  console.log("🗑️  Cleared existing data");

  // ── PROFILE ──────────────────────────────────────────────
  await prisma.profile.create({
    data: {
      name: "Shivansh Srivastava",
      role: "AI Engineer | Full-Stack Developer | AIR 15 SRMJEEE",
      email: "shivanshsrivastava495@gmail.com",
      linkedin: "https://www.linkedin.com/in/shivansh-srivastava-3a2a161b5/",
      github: "https://github.com/Shivansh-00",
      leetcode: "https://leetcode.com/u/YjPHT2lSCY/"
    }
  });
  console.log("✅ Profile seeded");

  // ── SKILL CATEGORIES & SKILLS (from Official Resume) ─────
  const skillData: { name: string; skills: string[] }[] = [
    {
      name: "Programming Languages",
      skills: ["C", "C++", "Python"]
    },
    {
      name: "Web & Data",
      skills: ["React", "Node.js", "Express.js", "FastAPI", "Flask", "TensorFlow"]
    },
    {
      name: "Databases",
      skills: ["MongoDB", "MySQL", "Firebase"]
    },
    {
      name: "Enterprise Systems",
      skills: ["SAP ERP", "SAP S/4HANA", "HANA Architecture"]
    },
    {
      name: "Data Structures",
      skills: ["Arrays", "Linked Lists", "Trees", "Graphs", "Heaps", "HashMaps"]
    },
    {
      name: "Tools",
      skills: [
        "SQLite",
        "PostgreSQL",
        "Git",
        "GitHub",
        "Docker",
        "WebRTC",
        "WebSockets",
        "JWT",
        "Jupyter",
        "REST APIs"
      ]
    }
  ];

  let totalSkills = 0;
  for (const category of skillData) {
    await prisma.skillCategory.create({
      data: {
        name: category.name,
        skills: {
          create: category.skills.map((name) => ({ name }))
        }
      }
    });
    totalSkills += category.skills.length;
  }
  console.log(`✅ Skills seeded (${skillData.length} categories, ${totalSkills} skills)`);

  // ── EXPERIENCE / Quest Log (from Official Resume) ────────
  const experienceData = [
    {
      title: "B.Tech in Computer Science & Engineering",
      organization: "SRM Institute of Science and Technology, Chennai",
      startDate: "2023-08",
      endDate: null,
      highlights: JSON.stringify([
        "CGPA: 9.069 / 10.00",
        "100% Founder's Scholarship Recipient (Full Tuition Fee Waiver)",
        "All India Rank 15 in SRMJEEE 2023 among 100,000+ candidates"
      ])
    },
    {
      title: "Frontend Developer Intern",
      organization: "Eventful India Marketing Services, Remote",
      startDate: "2025-07",
      endDate: "2025-10",
      highlights: JSON.stringify([
        "Developed client-facing dashboards and presentations using React & Next.js to support business decision-making",
        "Built reusable UI components and analytics-driven interfaces, reducing turnaround time by 30%",
        "Improved application performance and usability, delivering 95+ Lighthouse scores",
        "Collaborated cross-functionally to translate business requirements into structured technical solutions"
      ])
    },
    {
      title: "Full Stack Developer Intern",
      organization: "Techno Hacks Pvt. Ltd, Remote",
      startDate: "2024-12",
      endDate: "2025-01",
      highlights: JSON.stringify([
        "Designed scalable applications and APIs handling 10,000+ daily transactions, emphasizing reliability and accuracy",
        "Conducted data validation, testing, and performance analysis to support operational efficiency",
        "Improved UI/UX through structured debugging and analytics-driven enhancements"
      ])
    },
    {
      title: "Campus Ambassador",
      organization: "E-Cell, IIT Bombay, Chennai",
      startDate: "2024-08",
      endDate: null,
      highlights: JSON.stringify([
        "Led entrepreneurship initiatives and organized technical workshops/events for 500+ students",
        "Fostered innovation culture and coordinated with industry leaders to deliver impactful programs"
      ])
    },
    {
      title: "ICSE — Class XII",
      organization: "South City Public School, Kanpur",
      startDate: "2020",
      endDate: "2021",
      highlights: JSON.stringify([
        "Indian Certificate of Secondary Education (ICSE)",
        "Completed senior secondary education with focus on Science stream"
      ])
    },
    {
      title: "ICSE — Class X",
      organization: "Mercy Memorial School, Kanpur",
      startDate: "2019",
      endDate: "2020",
      highlights: JSON.stringify([
        "Indian Certificate of Secondary Education (ICSE)",
        "Strong foundation in mathematics and computer science"
      ])
    },
    {
      title: "Achievements & Certifications",
      organization: "Professional Development",
      startDate: "2023-01",
      endDate: "2025-12",
      highlights: JSON.stringify([
        "All India Rank 15: SRMJEEE 2023 (100% tuition fee waiver among 100,000+ candidates)",
        "96/100: e-Yantra IIT Bombay Embedded Systems MOOC",
        "Fortinet Certified Associate in Cybersecurity",
        "NPTEL Certifications: Programming in Java, Machine Learning, Database Management System",
        "Cisco Networking Certifications: Networking Fundamentals and Protocols",
        "Oracle Certified Foundations Associate: Core Java and database fundamentals"
      ])
    }
  ];

  for (const exp of experienceData) {
    await prisma.experience.create({ data: exp });
  }
  console.log(`✅ Experience seeded (${experienceData.length} quests)`);

  // ── PROJECTS / Arsenal (from Official Resume) ────────────
  const projectData = [
    {
      name: "Intelligent Option Pricing Platform",
      description:
        "AI-powered option pricing platform using Monte Carlo simulations and NLP-based parameter extraction for accurate financial valuation.",
      tags: JSON.stringify([
        "AI",
        "Monte Carlo Simulations",
        "NLP",
        "Financial Valuation",
        "Python"
      ]),
      featured: true,
      repoUrl: "https://github.com/Shivansh-00",
      liveUrl: null,
      isVisible: true
    },
    {
      name: "Smart e-Yantra Digital Twin System",
      description:
        "Real-time digital twin system integrating IoT hardware with 3D simulations. WebSocket-based communication achieving sub-100ms latency.",
      tags: JSON.stringify([
        "IoT",
        "3D Simulation",
        "Real-time Data Processing",
        "WebSockets",
        "Digital Twin"
      ]),
      featured: true,
      repoUrl: "https://github.com/Shivansh-00",
      liveUrl: null,
      isVisible: true
    },
    {
      name: "Web App Security Assessment Framework",
      description:
        "Security assessment tool addressing OWASP Top 10 vulnerabilities with automated vulnerability scanning and actionable security report generation.",
      tags: JSON.stringify([
        "Cybersecurity",
        "OWASP Top 10",
        "Penetration Testing",
        "Python",
        "Automation"
      ]),
      featured: true,
      repoUrl: "https://github.com/Shivansh-00",
      liveUrl: null,
      isVisible: true
    },
    {
      name: "AI-Powered Portfolio",
      description:
        "Cyberpunk-themed portfolio with Three.js 3D backgrounds, procedural audio engine, and gaming-style UI. Built with Next.js 14, Express.js, Prisma ORM, and real-time GitHub/LeetCode stats.",
      tags: JSON.stringify([
        "Next.js",
        "Three.js",
        "TypeScript",
        "Express.js",
        "Prisma",
        "Tailwind CSS"
      ]),
      featured: false,
      repoUrl: "https://github.com/Shivansh-00/My-Portfolio",
      liveUrl: null,
      isVisible: true
    }
  ];

  for (const project of projectData) {
    await prisma.project.create({ data: project });
  }
  console.log(`✅ Projects seeded (${projectData.length} items, ${projectData.filter(p => p.featured).length} legendary)`);

  console.log("\n🎮 DATABASE FULLY LOADED — ALL SYSTEMS ONLINE");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
