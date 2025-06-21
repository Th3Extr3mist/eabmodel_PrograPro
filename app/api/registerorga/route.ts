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
    const { organizer_name, contact, organizer_type } = await request.json();

    if (!organizer_name || !contact) {
      return NextResponse.json({ error: "Nombre y contraseña requeridos" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const existing = await client.query(
        "SELECT 1 FROM Organizer WHERE organizer_name = $1",
        [organizer_name]
      );
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: "Organizador ya existe" }, { status: 400 });
      }

      const hashedContact = await bcrypt.hash(contact, 10);

      const result = await client.query(
        `INSERT INTO Organizer (organizer_name, contact, organizer_type)
         VALUES ($1, $2, $3)
         RETURNING organizer_id, organizer_name`,
        [organizer_name, hashedContact, organizer_type || null]
      );
      const newOrga = result.rows[0];

      const token = jwt.sign(
        { organizer_id: newOrga.organizer_id, organizer_name: newOrga.organizer_name },
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
    console.error("Error en registro de organizador:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}