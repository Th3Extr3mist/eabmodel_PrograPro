import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const client = await pool.connect();

    const query = "SELECT * FROM AppUser WHERE email = $1";
    const result = await client.query(query, [email]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
    }

    const user = result.rows[0];

    if (password !== user.user_password) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      userId: user.user_id,
      userName: user.user_name,
      email: user.email,
    });
  } catch (error) {
    console.error("Error al autenticar:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
