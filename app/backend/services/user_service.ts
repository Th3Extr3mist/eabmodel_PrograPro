// backend/services/user_service.ts
import prisma from "../config/prisma";
import { CreateUserDto, UpdateUserDto } from "../dtos/user_dto";

export const UserService = {
  /** Crea un nuevo usuario */
  async create(dto: CreateUserDto) {
    console.log("🎯 [UserService.create] DTO recibido:", dto);

    // Inserta en la BD, prisma manejará las columnas opcionales
    const user = await prisma.appuser.create({
      data: {
        email: dto.email,
        user_name: dto.user_name,
        user_password: dto.user_password, // ya hasheado en el Controller
        age: dto.age,
        preference_1: dto.preference_1 ?? undefined,
        preference_2: dto.preference_2 ?? undefined,
        preference_3: dto.preference_3 ?? undefined,
      },
    });

    console.log("✅ [UserService.create] Usuario guardado:", user);
    return user;
  },

  /** Lista todos los usuarios */
  async getAll() {
    return prisma.appuser.findMany();
  },

  /** Obtiene un usuario por su UUID */
  async getById(userId: string) {
    return prisma.appuser.findUnique({
      where: { user_id: userId },
    });
  },

  /** Actualiza un usuario */
  async update(userId: string, dto: UpdateUserDto) {
    console.log(`🎯 [UserService.update] DTO recibido para ${userId}:`, dto);

    const data: any = {
      ...(dto.email        && { email: dto.email }),
      ...(dto.user_name    && { user_name: dto.user_name }),
      ...(dto.age !== undefined && { age: dto.age }),
      ...(dto.preference_1 !== undefined && { preference_1: dto.preference_1 }),
      ...(dto.preference_2 !== undefined && { preference_2: dto.preference_2 }),
      ...(dto.preference_3 !== undefined && { preference_3: dto.preference_3 }),
      ...(dto.user_password && { user_password: dto.user_password }),  // ya hasheado
    };

    const updated = await prisma.appuser.update({
      where: { user_id: userId },
      data,
    });

    console.log("✅ [UserService.update] Usuario actualizado:", updated);
    return updated;
  },

  /** Elimina un usuario */
  async delete(userId: string) {
    return prisma.appuser.delete({
      where: { user_id: userId },
    });
  },
};
