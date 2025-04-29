import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth";

// Esta función maneja las solicitudes GET a esta ruta del API
export async function GET() {
  // Intenta obtener los datos del token de autenticación
  const authData = getAuthToken();

  // Devuelve una respuesta JSON indicando si el usuario está autenticado
  return NextResponse.json({ authenticated: !!authData });
}
