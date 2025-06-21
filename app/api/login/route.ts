import { NextResponse } from "next/server";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import bcrypt from "bcryptjs";

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
});

// Ensure JWT secret is defined
if (!process.env.JWT_SECRET_KEY) {
  throw new Error("JWT_SECRET_KEY is not defined in environment variables");
}
const SECRET_KEY = process.env.JWT_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const query = "SELECT user_id, email, user_password FROM AppUser WHERE email = $1";
      const result = await client.query(query, [email]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.user_password);
      if (!passwordMatch) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      // Generate token
      const token = jwt.sign(
        { user_id: user.user_id, email: user.email },  // ← clave
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      // Set HTTP-only cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: 60 * 60, // 1h
        path: "/",
      };
      const serializedToken = serialize("authToken", token, cookieOptions);

      // Return JSON including token
      const response = NextResponse.json(
        {
          success: true,
          token,           // ← aquí
          user: {
            id: user.user_id,
            email: user.email
          }
        },
        { status: 200 }
      );
      response.headers.append("Set-Cookie", serializedToken);
      return response;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
