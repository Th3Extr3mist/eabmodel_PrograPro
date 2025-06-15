import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key";

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

export async function getAuthToken(): Promise<AuthTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as AuthTokenPayload;
    return decoded;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}