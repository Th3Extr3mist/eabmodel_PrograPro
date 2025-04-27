import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  const serializedToken = serialize("authToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: -1, // Expirar inmediatamente
    path: "/",
  });

  const response = NextResponse.json({ success: true });
  response.headers.set("Set-Cookie", serializedToken);
  return response;
}