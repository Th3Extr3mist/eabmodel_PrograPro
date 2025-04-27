import { NextResponse } from "next/server";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const client = await pool.connect();
    const query = "SELECT * FROM AppUser WHERE email = $1";
    const result = await client.query(query, [email]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    if (password !== user.user_password) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    const serializedToken = serialize("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60,
      path: "/",
    });

    const response = NextResponse.json(
      { success: true, user: { id: user.user_id, email: user.email } },
      { status: 200 }
    );

    response.headers.set("Set-Cookie", serializedToken);
    return response;
  } catch (error) {
    console.error("Error al autenticar:", error);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}