
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, SECRET_KEY) as { organizer_id: number };
    const organizer_id = decoded.organizer_id;

    if (!organizer_id) {
      return NextResponse.json({ error: "Token no contiene organizer_id" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM EventInfo WHERE organizer_id = $1 ORDER BY event_date DESC",
        [organizer_id]
      );
      return NextResponse.json({ events: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error al obtener eventos del organizador:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
