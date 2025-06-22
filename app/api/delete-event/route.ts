// app/api/delete-event/route.ts

import { NextResponse } from "next/server";
import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key";

export async function DELETE(request: Request) {
  try {
    const token = request.headers.get("cookie")
      ?.split(";")
      .find((c) => c.trim().startsWith("authToken="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, SECRET_KEY) as { organizer_id: number };
    const organizer_id = decoded.organizer_id;

    const { event_id } = await request.json();
    if (!event_id) {
      return NextResponse.json({ error: "Event ID requerido" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        "DELETE FROM EventInfo WHERE event_id = $1 AND organizer_id = $2 RETURNING *",
        [event_id, organizer_id]
      );

      if (result.rowCount === 0) {
        return NextResponse.json({ error: "Evento no encontrado o no autorizado" }, { status: 403 });
      }

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}