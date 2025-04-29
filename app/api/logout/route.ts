import { NextResponse } from "next/server";
import { serialize } from "cookie";

// Endpoint POST para cerrar sesión
export async function POST() {
  // Serializa una cookie vacía con el mismo nombre para sobrescribir y eliminar la existente
  const serializedToken = serialize("authToken", "", {
    httpOnly: true,                            
    secure: process.env.NODE_ENV === "production", 
    sameSite: "strict",                        
    maxAge: -1,                                
    path: "/",                                 
  });

  // Crea una respuesta indicando éxito (true)
  const response = NextResponse.json({ success: true });

  // Adjunta la cookie expirada a la cabecera para eliminarla del navegador
  response.headers.set("Set-Cookie", serializedToken);

  return response;
}
