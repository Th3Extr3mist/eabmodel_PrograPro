import { NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
});

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key";
if (!process.env.JWT_SECRET_KEY) {
  console.warn("USING DEFAULT JWT SECRET – NOT SAFE FOR PROD");
}

export async function POST(request: Request) {
  try {
    const {
      user_name,
      email,
      user_password,
      preference_1,
      preference_2,
      preference_3,
    } = await request.json();

    if (!email || !user_password || !user_name) {
      return NextResponse.json(
        { error: "Email, contraseña y nombre son requeridos" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // Check existing
      const existing = await client.query(
        "SELECT 1 FROM AppUser WHERE email = $1",
        [email]
      );
      if (existing.rows.length > 0) {
        return NextResponse.json(
          { error: "El correo ya está registrado" },
          { status: 400 }
        );
      }

      // Hash
      const hashedPassword = await bcrypt.hash(user_password, 10);

      // Insert
      const insert = await client.query(
        `INSERT INTO AppUser (
           user_name, email, user_password,
           preference_1, preference_2, preference_3
         ) VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING user_id, email`,
        [
          user_name,
          email,
          hashedPassword,
          preference_1,
          preference_2,
          preference_3,
        ]
      );
      const newUser = insert.rows[0];

      // JWT
      const token = jwt.sign(
        { user_id: newUser.user_id, email: newUser.email },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: 60 * 60,
        path: "/",
      };
      const serializedToken = serialize("authToken", token, cookieOptions);

      // Return JSON + cookie
      const response = NextResponse.json(
        {
          success: true,
          token,         // ← aquí también
          user: {
            id: newUser.user_id,
            email: newUser.email
          }
        },
        { status: 201 }
      );
      response.headers.append("Set-Cookie", serializedToken);
      return response;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}