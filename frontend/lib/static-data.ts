import type {
  Profile,
  SkillCategory,
  ExperienceItem,
  Project,
  GitHubStats,
  LeetCodeStats,
} from "@/types/api";

export const staticProfile: Profile = {
  name: "Shivansh Srivastava",
  role: "AI Engineer | Full-Stack Developer | AIR 15 SRMJEEE",
  email: "shivanshsrivastava495@gmail.com",
  linkedin: "https://www.linkedin.com/in/shivansh-srivastava-3a2a161b5/",
  github: "https://github.com/Shivansh-00",
  leetcode: "https://leetcode.com/u/YjPHT2lSCY/",
};

export const staticSkills: SkillCategory[] = [
  {
    id: "cat-1",
    name: "Programming Languages",
    skills: ["C", "C++", "Python"],
  },
  {
    id: "cat-2",
    name: "Web & Data",
    skills: ["React", "Node.js", "Express.js", "FastAPI", "Flask", "TensorFlow"],
  },
  {
    id: "cat-3",
    name: "Databases",
    skills: ["MongoDB", "MySQL", "Firebase"],
  },
  {
    id: "cat-4",
    name: "Enterprise Systems",
    skills: ["SAP ERP", "SAP S/4HANA", "HANA Architecture"],
  },
  {
    id: "cat-5",
    name: "Data Structures",
    skills: ["Arrays", "Linked Lists", "Trees", "Graphs", "Heaps", "HashMaps"],
  },
  {
    id: "cat-6",
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

export const staticExperience: ExperienceItem[] = [
  {
    id: "exp-1",
    title: "B.Tech in Computer Science & Engineering",
    organization: "SRM Institute of Science and Technology, Chennai",
    startDate: "2023-08",
    highlights: [
      "CGPA: 9.32 / 10.00",
      "100% Founder's Scholarship Recipient (Full Tuition Fee Waiver)",
      "All India Rank 15 in SRMJEEE 2023 among 100,000+ candidates",
    ],
  },
  {
    id: "exp-2",
    title: "Frontend Developer Intern",
    organization: "Eventful India Marketing Services, Remote",
    startDate: "2025-07",
    endDate: "2025-10",
    highlights: [
      "Developed client-facing dashboards and presentations using React & Next.js to support business decision-making",
      "Built reusable UI components and analytics-driven interfaces, reducing turnaround time by 30%",
      "Improved application performance and usability, delivering 95+ Lighthouse scores",
      "Collaborated cross-functionally to translate business requirements into structured technical solutions",
    ],
  },
  {
    id: "exp-3",
    title: "Full Stack Developer Intern",
    organization: "Techno Hacks Pvt. Ltd, Remote",
    startDate: "2024-12",
    endDate: "2025-01",
    highlights: [
      "Designed scalable applications and APIs handling 10,000+ daily transactions, emphasizing reliability and accuracy",
      "Conducted data validation, testing, and performance analysis to support operational efficiency",
      "Improved UI/UX through structured debugging and analytics-driven enhancements",
    ],
  },
  {
    id: "exp-4",
    title: "Campus Ambassador",
    organization: "E-Cell, IIT Bombay, Chennai",
    startDate: "2024-08",
    highlights: [
      "Led entrepreneurship initiatives and organized technical workshops/events for 500+ students",
      "Fostered innovation culture and coordinated with industry leaders to deliver impactful programs",
    ],
  },
  {
    id: "exp-5",
    title: "ICSE — Class XII",
    organization: "South City Public School, Kanpur",
    startDate: "2020",
    endDate: "2021",
    highlights: [
      "Indian Certificate of Secondary Education (ICSE)",
      "Completed senior secondary education with focus on Science stream",
    ],
  },
  {
    id: "exp-6",
    title: "ICSE — Class X",
    organization: "Mercy Memorial School, Kanpur",
    startDate: "2019",
    endDate: "2020",
    highlights: [
      "Indian Certificate of Secondary Education (ICSE)",
      "Strong foundation in mathematics and computer science",
    ],
  },
  {
    id: "exp-7",
    title: "Achievements & Certifications",
    organization: "Professional Development",
    startDate: "2023-01",
    endDate: "2025-12",
    highlights: [
      "All India Rank 15: SRMJEEE 2023 (100% tuition fee waiver among 100,000+ candidates)",
      "96/100: e-Yantra IIT Bombay Embedded Systems MOOC",
      "Fortinet Certified Associate in Cybersecurity",
      "NPTEL Certifications: Programming in Java, Machine Learning, Database Management System",
      "Cisco Networking Certifications: Networking Fundamentals and Protocols",
      "Oracle Certified Foundations Associate: Core Java and database fundamentals",
    ],
  },
];

export const staticProjects: Project[] = [
  {
    id: "proj-1",
    name: "Intelligent Option Pricing & Risk Analytics Platform",
    description:
      "Research-grade AI-powered financial analytics platform that transforms traditional option pricing into an intelligent, production-ready system. Leverages Monte Carlo simulations for stochastic price modeling and integrates NLP-based parameter extraction to intelligently process financial inputs.",
    tags: ["AI", "Quant Finance", "Monte Carlo", "Deep Learning", "NLP", "Risk Analytics"],
    featured: true,
    repoUrl: "https://github.com/Shivansh-00/Option-Pricing-Using-Monte-Carlo-Simulation-Deep-Learning",
  },
  {
    id: "proj-2",
    name: "Self-Baseline Intelligence (SBI)",
    description:
      "NLP-driven system that detects gradual cognitive compression by comparing users against their own historical language patterns. Measures structural and semantic shifts in language, generating a Cognitive Compression Index (CCI) to quantify long-term drift with explainable summaries.",
    tags: ["NLP", "Cognitive Drift Detection", "Explainable AI", "Python", "Linguistic Analysis"],
    featured: true,
    repoUrl: "https://github.com/Shivansh-00/Self-Baseline-Intelligence",
  },
  {
    id: "proj-3",
    name: "AI Productivity OS – Intelligent To-Do System",
    description:
      "AI-powered task management backend designed as a foundation for a next-generation Productivity Operating System. Features versioned FastAPI endpoints, nested task structures, AI-powered task breakdown & effort estimation, real-time updates via WebSockets, and behavioral analytics.",
    tags: ["FastAPI", "Real-Time Systems", "Behavioral Analytics", "AI", "WebSockets"],
    featured: true,
    repoUrl: "https://github.com/Shivansh-00/To-Do-List",
  },
  {
    id: "proj-4",
    name: "Hunger Help – Social Impact Platform",
    description:
      "Web-based platform designed to address food insecurity by connecting restaurants, shelters, and communities in need. Streamlines meal distribution and improves access to nourishment for underprivileged populations through accessible, scalable technology.",
    tags: ["Web Development", "Humanitarian Tech", "Scalable Design", "Social Impact"],
    featured: false,
    repoUrl: "https://github.com/Shivansh-00/Hunger_Help",
  },
];

export const staticGithub: GitHubStats = {
  topRepos: [
    { name: "My-Portfolio", url: "https://github.com/Shivansh-00/My-Portfolio", stars: 3 },
    { name: "Integrated-Management-Business-Suite", url: "https://github.com/Shivansh-00/Integrated-Management-Business-Suite", stars: 3 },
    { name: "Option-Pricing-Using-Monte-Carlo-Simulation-Deep-Learning", url: "https://github.com/Shivansh-00/Option-Pricing-Using-Monte-Carlo-Simulation-Deep-Learning", stars: 3 },
    { name: "To-Do-List", url: "https://github.com/Shivansh-00/To-Do-List", stars: 2 },
    { name: "Chat-Application", url: "https://github.com/Shivansh-00/Chat-Application", stars: 1 },
  ],
  languages: [
    { name: "TypeScript", percentage: 38 },
    { name: "Python", percentage: 27 },
    { name: "JavaScript", percentage: 18 },
    { name: "C++", percentage: 10 },
    { name: "HTML", percentage: 7 },
  ],
  recentCommits: 24,
};

export const staticLeetcode: LeetCodeStats = {
  totalSolved: 346,
  easy: 110,
  medium: 182,
  hard: 54,
};
