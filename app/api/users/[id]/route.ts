// app/api/users/[id]/route.ts
import { NextRequest } from 'next/server';
import { UserController } from '../../../backend/controllers/user_controller';

export async function GET(req: NextRequest, ctx: { params: { id: string } }) {
  return UserController.getById(ctx.params.id);
}
export async function PUT(req: NextRequest, ctx: { params: { id: string } }) {
  return UserController.update(ctx.params.id, req);
}

export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
  return UserController.delete(ctx.params.id);
}