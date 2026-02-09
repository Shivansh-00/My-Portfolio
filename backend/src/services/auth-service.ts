import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET ?? "";
const adminEmail = process.env.ADMIN_EMAIL ?? "";
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH ?? "";

export async function login(email: string, password: string) {
  if (!adminEmail || !adminPasswordHash || !jwtSecret) {
    throw new Error("Admin credentials not configured");
  }

  if (email !== adminEmail) {
    return null;
  }

  const valid = await bcrypt.compare(password, adminPasswordHash);
  if (!valid) {
    return null;
  }

  const token = jwt.sign({ email }, jwtSecret, { expiresIn: "8h" });
  return token;
}

export function verifyToken(token: string) {
  if (!jwtSecret) {
    throw new Error("JWT secret not configured");
  }
  return jwt.verify(token, jwtSecret) as { email: string };
}
