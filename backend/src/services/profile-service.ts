import { getProfile } from "../repositories/profile-repository";

const DEFAULT_PROFILE = {
  name: "Shivansh Srivastava",
  role: "AI Engineer | Full-Stack Developer | AIR 15 SRMJEEE",
  email: "shivanshsrivastava495@gmail.com",
  linkedin: "https://www.linkedin.com/in/shivansh-srivastava-3a2a161b5/",
  github: "https://github.com/Shivansh-00",
  leetcode: "https://leetcode.com/u/YjPHT2lSCY/"
};

export async function loadProfile() {
  try {
    const profile = await getProfile();
    return (
      profile ?? {
        id: "default",
        ...DEFAULT_PROFILE
      }
    );
  } catch (error) {
    return { id: "default", ...DEFAULT_PROFILE };
  }
}
