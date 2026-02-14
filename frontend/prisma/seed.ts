import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.skill.deleteMany();
  await prisma.skillCategory.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.project.deleteMany();
  await prisma.profile.deleteMany();

  // PROFILE
  await prisma.profile.create({
    data: {
      name: "Shivansh Srivastava",
      role: "AI Engineer | Full-Stack Developer | AIR 15 SRMJEEE",
      email: "shivanshsrivastava495@gmail.com",
      linkedin: "https://www.linkedin.com/in/shivansh-srivastava-3a2a161b5/",
      github: "https://github.com/Shivansh-00",
      leetcode: "https://leetcode.com/u/YjPHT2lSCY/",
    },
  });

  // SKILLS
  const skillsData: { name: string; skills: string[] }[] = [
    { name: "Programming Languages", skills: ["C", "C++", "Python"] },
    {
      name: "Web & Data",
      skills: [
        "React",
        "Node.js",
        "Express.js",
        "FastAPI",
        "Flask",
        "TensorFlow",
      ],
    },
    { name: "Databases", skills: ["MongoDB", "MySQL", "Firebase"] },
    {
      name: "Enterprise Systems",
      skills: ["SAP ERP", "SAP S/4HANA", "HANA Architecture"],
    },
    {
      name: "Data Structures",
      skills: ["Arrays", "Linked Lists", "Trees", "Graphs", "Heaps", "HashMaps"],
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
        "REST APIs",
      ],
    },
  ];

  for (const cat of skillsData) {
    await prisma.skillCategory.create({
      data: {
        name: cat.name,
        skills: {
          create: cat.skills.map((s) => ({ name: s })),
        },
      },
    });
  }

  // EXPERIENCE
  const experienceData = [
    {
      title: "B.Tech in Computer Science & Engineering",
      organization: "SRM Institute of Science and Technology, Chennai",
      startDate: "2023-08",
      endDate: null,
      highlights: JSON.stringify([
        "CGPA: 9.32 / 10.00",
        "100% Founder's Scholarship Recipient (Full Tuition Fee Waiver)",
        "All India Rank 15 in SRMJEEE 2023 among 100,000+ candidates",
      ]),
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
        "Collaborated cross-functionally to translate business requirements into structured technical solutions",
      ]),
    },
    {
      title: "Full Stack Developer Intern",
      organization: "Techno Hacks Pvt. Ltd, Remote",
      startDate: "2024-12",
      endDate: "2025-01",
      highlights: JSON.stringify([
        "Designed scalable applications and APIs handling 10,000+ daily transactions, emphasizing reliability and accuracy",
        "Conducted data validation, testing, and performance analysis to support operational efficiency",
        "Improved UI/UX through structured debugging and analytics-driven enhancements",
      ]),
    },
    {
      title: "Campus Ambassador",
      organization: "E-Cell, IIT Bombay, Chennai",
      startDate: "2024-08",
      endDate: null,
      highlights: JSON.stringify([
        "Led entrepreneurship initiatives and organized technical workshops/events for 500+ students",
        "Fostered innovation culture and coordinated with industry leaders to deliver impactful programs",
      ]),
    },
    {
      title: "ICSE — Class XII",
      organization: "South City Public School, Kanpur",
      startDate: "2020",
      endDate: "2021",
      highlights: JSON.stringify([
        "Indian Certificate of Secondary Education (ICSE)",
        "Completed senior secondary education with focus on Science stream",
      ]),
    },
    {
      title: "ICSE — Class X",
      organization: "Mercy Memorial School, Kanpur",
      startDate: "2019",
      endDate: "2020",
      highlights: JSON.stringify([
        "Indian Certificate of Secondary Education (ICSE)",
        "Strong foundation in mathematics and computer science",
      ]),
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
        "Oracle Certified Foundations Associate: Core Java and database fundamentals",
      ]),
    },
  ];

  for (const exp of experienceData) {
    await prisma.experience.create({ data: exp });
  }

  // PROJECTS
  const projectsData = [
    {
      name: "Intelligent Option Pricing & Risk Analytics Platform",
      description:
        "Research-grade AI-powered financial analytics platform that transforms traditional option pricing into an intelligent, production-ready system. Leverages Monte Carlo simulations for stochastic price modeling and integrates NLP-based parameter extraction to intelligently process financial inputs.",
      tags: JSON.stringify([
        "AI",
        "Quant Finance",
        "Monte Carlo",
        "Deep Learning",
        "NLP",
        "Risk Analytics",
      ]),
      featured: true,
      repoUrl: "https://github.com/Shivansh-00/Option-Pricing-Using-Monte-Carlo-Simulation-Deep-Learning",
    },
    {
      name: "Self-Baseline Intelligence (SBI)",
      description:
        "NLP-driven system that detects gradual cognitive compression by comparing users against their own historical language patterns. Measures structural and semantic shifts in language, generating a Cognitive Compression Index (CCI) to quantify long-term drift with explainable summaries.",
      tags: JSON.stringify([
        "NLP",
        "Cognitive Drift Detection",
        "Explainable AI",
        "Python",
        "Linguistic Analysis",
      ]),
      featured: true,
      repoUrl: "https://github.com/Shivansh-00/Self-Baseline-Intelligence",
    },
    {
      name: "AI Productivity OS – Intelligent To-Do System",
      description:
        "AI-powered task management backend designed as a foundation for a next-generation Productivity Operating System. Features versioned FastAPI endpoints, nested task structures, AI-powered task breakdown & effort estimation, real-time updates via WebSockets, and behavioral analytics.",
      tags: JSON.stringify([
        "FastAPI",
        "Real-Time Systems",
        "Behavioral Analytics",
        "AI",
        "WebSockets",
      ]),
      featured: true,
      repoUrl: "https://github.com/Shivansh-00/To-Do-List",
    },
    {
      name: "Hunger Help – Social Impact Platform",
      description:
        "Web-based platform designed to address food insecurity by connecting restaurants, shelters, and communities in need. Streamlines meal distribution and improves access to nourishment for underprivileged populations through accessible, scalable technology.",
      tags: JSON.stringify([
        "Web Development",
        "Humanitarian Tech",
        "Scalable Design",
        "Social Impact",
      ]),
      featured: false,
      repoUrl: "https://github.com/Shivansh-00/Hunger_Help",
    },
  ];

  for (const proj of projectsData) {
    await prisma.project.create({ data: proj });
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
