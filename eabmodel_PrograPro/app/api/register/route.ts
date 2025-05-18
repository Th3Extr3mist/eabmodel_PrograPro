import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// Conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const { user_name, email, user_password } = await request.json();

    if (!user_name || !email || !user_password) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    const client = await pool.connect();

    // Insertar usuario en AppUser
    const insertQuery = `
      INSERT INTO AppUser (user_name, email, user_password)
      VALUES ($1, $2, $3)
      RETURNING user_id;
    `;

    const result = await client.query(insertQuery, [user_name, email, user_password]);
    client.release();

    return NextResponse.json({ success: true, userId: result.rows[0].user_id });
  } catch (error) {
    console.error("Error al registrar:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}