import { listSkillCategories } from "../repositories/skills-repository";

export async function loadSkills() {
  try {
    const categories = await listSkillCategories();
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      skills: category.skills.map((skill) => skill.name)
    }));
  } catch (error) {
    return [];
  }
}
