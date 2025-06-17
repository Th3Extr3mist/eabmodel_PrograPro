import { NextRequest } from 'next/server';
import { UserController } from '../../backend/controllers/user_controller';

export async function GET(req: NextRequest) {
  return UserController.getAll();
}
export async function POST(req: NextRequest) {
  return UserController.create(req);
}