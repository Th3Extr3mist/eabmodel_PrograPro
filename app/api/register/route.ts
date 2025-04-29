import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

// Configura conexión con la base de datos de Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Clave secreta para firmar el JWT
const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key";

// Manejador POST para registrar un nuevo usuario
export async function POST(request: NextRequest) {
  try {
    // Llama a la base de datos para ver si existen los siguientes campos
    const { user_name, email, user_password } = await request.json();

    // Verifica que todos los campos estén presentes
    if (!user_name || !email || !user_password) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    // Conecta con la base de datos
    const client = await pool.connect();

    // Verifica si el correo ya está registrado
    const checkUserQuery = "SELECT * FROM AppUser WHERE email = $1";
    const userExists = await client.query(checkUserQuery, [email]);

    if (userExists.rows.length > 0) {
      client.release();
      return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 });
    }

    // Inserta el nuevo usuario en la base de datos
    const insertQuery = `
      INSERT INTO AppUser (user_name, email, user_password)
      VALUES ($1, $2, $3)
      RETURNING user_id, user_name, email;
    `;

    const result = await client.query(insertQuery, [user_name, email, user_password]);
    client.release();

    const newUser = result.rows[0];

    // Crea un token JWT con los datos del usuario
    const token = jwt.sign(
      { userId: newUser.user_id, email: newUser.email },
      SECRET_KEY,
      { expiresIn: "1h" }  
    );

    // Serializa el token como cookie HTTP
    const serializedToken = serialize("authToken", token, {
      httpOnly: true,                           
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",                       
      maxAge: 60 * 60,                          
      path: "/",                                
    });

    // Construye y retorna la respuesta con la cookie incluida
    const response = NextResponse.json({
      success: true,
      userId: newUser.user_id,
      userName: newUser.user_name,
      email: newUser.email,
    });

    response.headers.set("Set-Cookie", serializedToken);

    return response;
  } catch (error) {
    console.error("Error al registrar:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}