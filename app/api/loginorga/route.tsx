import { NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key";

export async function POST(request: Request) {
  try {
    const { organizer_name, contact } = await request.json();

    if (!organizer_name || !contact) {
      return NextResponse.json({ error: "Nombre y contraseña requeridos" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT organizer_id, organizer_name, contact FROM Organizer WHERE organizer_name = $1",
        [organizer_name]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
      }

      const organizer = result.rows[0];
      const isValid = await bcrypt.compare(contact, organizer.contact);
      if (!isValid) {
        return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
      }

      const token = jwt.sign(
        { organizer_id: organizer.organizer_id, organizer_name: organizer.organizer_name },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      const serialized = serialize("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60,
        path: "/",
      });

      const response = NextResponse.json({ success: true, token });
      response.headers.append("Set-Cookie", serialized);
      return response;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error en login de organizador:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}