import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key";

export function getUserFromToken(req: NextRequest) {
  // 🔑 Buscar token en la cookie 'authToken'
  const token = req.cookies.get("authToken")?.value;

  if (!token) {
    throw new Error("No token provided");
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (err) {
    throw new Error("Invalid token");
  }
}
