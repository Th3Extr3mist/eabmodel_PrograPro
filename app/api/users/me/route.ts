import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '../../../backend/middleware/AuthMiddleware';
import prisma from '../../../backend/config/prisma';

export async function GET(req: NextRequest) {
  const decoded = getUserFromToken(req);

  if (!decoded || typeof decoded !== 'object' || !('user_id' in decoded)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const user = await prisma.appuser.findUnique({
    where: { user_id: decoded.user_id },
  });

  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  return NextResponse.json({
    nombre: user.user_name,
    email: user.email,
    intereses: [
      user.preference_1,
      user.preference_2,
      user.preference_3,
    ].filter(Boolean), 
  });
}
