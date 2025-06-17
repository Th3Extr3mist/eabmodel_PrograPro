import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { hash } from "bcryptjs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import prisma from "../config/prisma";
import { CreateUserDto, UpdateUserDto } from "../dtos/user_dto";
import { getUserFromToken } from "../middleware/AuthMiddleware"; // Importamos la función de token
import { JwtPayload } from "jsonwebtoken"; // Importa JwtPayload para la verificación de tipo

export class UserController {
  /** POST /api/register */
  static async create(req: NextRequest) {
    try {
      const body = await req.json();
      console.log("🎯 Payload recibido en create user:", body);

      const dto = plainToInstance(CreateUserDto, body);
      const errors = await validate(dto);
      if (errors.length) {
        const errorMessages = errors.map(e => ({
          field: e.property,
          message: Object.values(e.constraints || {}).join(", ")
        }));
        return NextResponse.json({ message: "Validation failed", errors: errorMessages }, { status: 400 });
      }

      const hashed = await hash(dto.user_password, 12);
      const newUser = await prisma.appuser.create({
        data: {
          email: dto.email,
          user_name: dto.user_name,
          user_password: hashed,
          age: dto.age,
          preference_1: dto.preference_1 ?? undefined,
          preference_2: dto.preference_2 ?? undefined,
          preference_3: dto.preference_3 ?? undefined,
        }
      });

      console.log("✅ Usuario creado:", newUser);
      const { user_id, email, user_name, age, preference_1, preference_2, preference_3 } = newUser;
      return NextResponse.json({ user_id, email, user_name, age, preference_1, preference_2, preference_3 }, { status: 201 });
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        Array.isArray(error.meta?.target) &&
        (error.meta.target as string[]).includes("email")
      ) {
        return NextResponse.json({ message: "El email ya está registrado" }, { status: 409 });
      }
      console.error("[USER_CONTROLLER] Create error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  }

  /** GET /api/users/me */
  static async getCurrentUser(req: NextRequest) {
    try {
      const decoded = getUserFromToken(req);
      
      // Verificar que decoded sea del tipo JwtPayload
      if (!decoded || typeof decoded === "string" || !("user_id" in decoded)) {
        return NextResponse.json({ message: "Invalid token or user not found" }, { status: 401 });
      }

      const userId = decoded.user_id; // Ahora podemos acceder a user_id de forma segura

      const user = await prisma.appuser.findUnique({
        where: { user_id: userId }
      });

      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      const { user_id, email, user_name, age, preference_1, preference_2, preference_3 } = user;
      return NextResponse.json({ user_id, email, user_name, age, preference_1, preference_2, preference_3 });
    } catch (err) {
      console.error("[USER_CONTROLLER] GetCurrentUser error:", err);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  }

  /** GET /api/users/:id */
  static async getById(id: string) {
    try {
      const user = await prisma.appuser.findUnique({ where: { user_id: id } });
      if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

      const { user_id, email, user_name, age, preference_1, preference_2, preference_3 } = user;
      return NextResponse.json({ user_id, email, user_name, age, preference_1, preference_2, preference_3 });
    } catch (e) {
      console.error("[USER_CONTROLLER] GetById error:", e);
      return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
  }

  /** PUT /api/users/:id */
  static async update(id: string, req: NextRequest) {
    try {
      const body = await req.json();
      console.log(`🛠️ Payload recibido en update user ${id}:`, body);

      const dto = plainToInstance(UpdateUserDto, body);
      const errors = await validate(dto);
      if (errors.length) {
        const errorMessages = errors.map(e => ({
          field: e.property,
          message: Object.values(e.constraints || {}).join(", ")
        }));
        return NextResponse.json({ message: "Validation failed", errors: errorMessages }, { status: 400 });
      }

      const data: any = {};
      if (dto.email)        data.email = dto.email;
      if (dto.user_name)    data.user_name = dto.user_name;
      if (dto.age !== undefined) data.age = dto.age;
      if (dto.preference_1 !== undefined) data.preference_1 = dto.preference_1;
      if (dto.preference_2 !== undefined) data.preference_2 = dto.preference_2;
      if (dto.preference_3 !== undefined) data.preference_3 = dto.preference_3;
      if (dto.user_password) data.user_password = await hash(dto.user_password, 12);

      const updated = await prisma.appuser.update({ where: { user_id: id }, data });
      console.log("✅ Usuario actualizado:", updated);

      const { user_id, email, user_name, age, preference_1, preference_2, preference_3 } = updated;
      return NextResponse.json({ user_id, email, user_name, age, preference_1, preference_2, preference_3 });
    } catch (e) {
      console.error("[USER_CONTROLLER] Update error:", e);
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }
  }

  /** DELETE /api/users/:id */
  static async delete(id: string) {
    try {
      await prisma.appuser.delete({ where: {user_id: id } });
      return new NextResponse(null, { status: 204 });
    } catch (e) {
      console.error("[USER_CONTROLLER] Delete error:", e);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
  }

  /** GET /api/users */
  static async getAll() {
    try {
      const users = await prisma.appuser.findMany();
      const safe = users.map(u => ({
        user_id: u.user_id,
        email: u.email,
        user_name: u.user_name,
        age: u.age,
        preference_1: u.preference_1,
        preference_2: u.preference_2,
        preference_3: u.preference_3,
      }));
      return NextResponse.json(safe);
    } catch (e) {
      console.error("[USER_CONTROLLER] GetAll error:", e);
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }
  }
}
