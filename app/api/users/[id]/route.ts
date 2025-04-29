import { NextRequest, NextResponse } from 'next/server';
import { UserController } from '../../../backend/controllers/user_controller';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return UserController.getById(params.id);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return UserController.update(params.id, req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return UserController.delete(params.id);
}