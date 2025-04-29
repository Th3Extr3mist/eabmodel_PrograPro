import { NextRequest, NextResponse } from 'next/server';
import { UserController } from '../../backend/controllers/user_controller';

export async function POST(req: NextRequest) {
  return UserController.create(req);
}

export async function GET(req: NextRequest) {
  return UserController.getAll();
}