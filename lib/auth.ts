// lib/auth.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key";

export async function getAuthToken() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("authToken")?.value;
  
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    return null;
  }
}