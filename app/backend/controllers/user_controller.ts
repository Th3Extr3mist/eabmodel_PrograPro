import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { hash } from 'bcryptjs';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '../../backend/config/prisma';
import { CreateUserDto, UpdateUserDto } from '../../backend/dtos/user_dto';
import { isValidUUID } from '../../backend/utils/validators';
import { getAuthToken } from '@/lib/auth';

export class UserController {
  static async create(req: NextRequest) {
    try {
      const body = await req.json();
      const dto = plainToInstance(CreateUserDto, body);
      const errors = await validate(dto);
      
      if (errors.length) {
        const errorMessages = errors.map(e => ({
          field: e.property,
          message: Object.values(e.constraints || {}).join(', ')
        }));
        return NextResponse.json(
          { message: 'Validation failed', errors: errorMessages },
          { status: 400 }
        );
      }

      const hashed = await hash(dto.user_password, 12);
      const newUser = await prisma.appuser.create({
        data: {
          email: dto.email,
          user_name: dto.user_name,
          user_password: hashed,
          age: dto.age
        }
      });

      const { user_id, email, user_name, age } = newUser;
      return NextResponse.json(
        { user_id, email, user_name, age },
        { status: 201 }
      );

    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        Array.isArray(error.meta?.target) &&
        (error.meta.target as string[]).includes('email')
      ) {
        return NextResponse.json(
          { message: 'El email ya está registrado' },
          { status: 409 }
        );
      }
      console.error('[USER_CONTROLLER] Create error:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  static async getAll() {
    try {
      const users = await prisma.appuser.findMany();
      const safe = users.map((u: any) => ({
        user_id: u.user_id,
        email: u.email,
        user_name: u.user_name,
        age: u.age
      }));
      return NextResponse.json(safe);
    } catch (error) {
      console.error('[USER_CONTROLLER] Get all error:', error);
      return NextResponse.json(
        { message: 'Database error' },
        { status: 500 }
      );
    }
  }

  static async getById(userId: string) {
    try {
      if (!isValidUUID(userId)) {
        return NextResponse.json(
          { message: 'Invalid user ID format' },
          { status: 400 }
        );
      }
      const u = await prisma.appuser.findUnique({
        where: { user_id: userId }
      });
      if (!u) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }
      const { user_id, email, user_name, age } = u;
      return NextResponse.json({ user_id, email, user_name, age });
    } catch (error) {
      console.error('[USER_CONTROLLER] Get by ID error:', error);
      return NextResponse.json(
        { message: 'Server error' },
        { status: 500 }
      );
    }
  }

  static async update(userId: string, req: NextRequest) {
    try {
      if (!isValidUUID(userId)) {
        return NextResponse.json(
          { message: 'Invalid user ID format' },
          { status: 400 }
        );
      }

      const body = await req.json();
      const dto = plainToInstance(UpdateUserDto, body);
      const errors = await validate(dto);
      
      if (errors.length) {
        const errorMessages = errors.map(e => ({
          field: e.property,
          message: Object.values(e.constraints || {}).join(', ')
        }));
        return NextResponse.json(
          { message: 'Validation failed', errors: errorMessages },
          { status: 400 }
        );
      }

      const data: Record<string, any> = {};
      if (dto.email) data.email = dto.email;
      if (dto.user_name) data.user_name = dto.user_name;
      if (dto.age !== undefined) data.age = dto.age;
      if (dto.user_password) {
        data.user_password = await hash(dto.user_password, 12);
      }

      const updated = await prisma.appuser.update({
        where: { user_id: userId },
        data
      });

      const { user_id, email, user_name, age } = updated;
      return NextResponse.json({ user_id, email, user_name, age });
    } catch (error) {
      console.error('[USER_CONTROLLER] Update error:', error);
      return NextResponse.json(
        { message: 'Database error' },
        { status: 500 }
      );
    }
  }

  static async delete(userId: string) {
    try {
      if (!isValidUUID(userId)) {
        return NextResponse.json(
          { message: 'Invalid user ID format' },
          { status: 400 }
        );
      }
      await prisma.appuser.delete({
        where: { user_id: userId }
      });
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      console.error('[USER_CONTROLLER] Delete error:', error);
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
  }

  static async getCurrentUser(req: NextRequest) {
  try {
    const authToken = getAuthToken();

    if (
      !authToken ||
      typeof authToken !== 'object' ||
      !('userId' in authToken) ||
      typeof authToken.userId !== 'string'
    ) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const { userId } = authToken as { userId: string };

    const user = await prisma.appuser.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        email: true,
        user_name: true,
        age: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[USER_CONTROLLER] Error al obtener usuario actual:', error);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}
}
