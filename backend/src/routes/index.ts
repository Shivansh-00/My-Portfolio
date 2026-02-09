import { Router } from "express";
import { getProfile } from "../controllers/profile-controller";
import { getSkills } from "../controllers/skills-controller";
import { getExperience } from "../controllers/experience-controller";
import { getProjects } from "../controllers/projects-controller";
import { getGitHubStats } from "../controllers/github-controller";
import { getLeetCodeStats } from "../controllers/leetcode-controller";
import { createContact } from "../controllers/contact-controller";
import { loginHandler } from "../controllers/auth-controller";
import { getContacts, updateProject } from "../controllers/admin-controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/profile", getProfile);
router.get("/skills", getSkills);
router.get("/experience", getExperience);
router.get("/projects", getProjects);
router.get("/github/stats", getGitHubStats);
router.get("/leetcode/stats", getLeetCodeStats);
router.post("/contact", createContact);
router.post("/auth/login", loginHandler);

router.get("/admin/contacts", requireAuth, getContacts);
router.patch("/admin/projects/:id", requireAuth, updateProject);

export default router;
