import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key";

interface TokenPayload {
  user_id: string;
}

export function getUserFromToken(req: NextRequest): TokenPayload {
  const token = req.cookies.get("authToken")?.value;

  if (!token) {
    throw new Error("No token provided");
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;

    if (!decoded.user_id) {
      throw new Error("Invalid token payload");
    }

    return decoded;
  } catch (err) {
    throw new Error("Invalid token");
  }
}
