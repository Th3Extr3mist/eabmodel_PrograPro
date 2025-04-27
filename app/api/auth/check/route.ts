import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth";

export async function GET() {
  const authData = getAuthToken();
  return NextResponse.json({ authenticated: !!authData });
}