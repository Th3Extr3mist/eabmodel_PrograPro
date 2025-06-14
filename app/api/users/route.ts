import { NextRequest } from 'next/server';
import { UserController } from '../../backend/controllers/user_controller';

// Maneja GET para obtener el usuario actual
export async function GET(req: NextRequest) {
  return UserController.getCurrentUser(req);
}

// Maneja POST para crear un nuevo usuario
export async function POST(req: NextRequest) {
  return UserController.create(req);
}