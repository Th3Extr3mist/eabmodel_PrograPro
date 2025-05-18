import prisma from '../config/prisma';
import { CreateUserDto, UpdateUserDto } from '../dtos/user_dto';

export const UserService = {
  async create(userData: CreateUserDto) {
    return prisma.appuser.create({
      data: userData
    });
  },

  async getAll() {
    return prisma.appuser.findMany();
  },

  async getById(userId: string) {
    return prisma.appuser.findUnique({
      where: { user_id: userId }
    });
  },

  async update(userId: string, updateData: UpdateUserDto) {
    return prisma.appuser.update({
      where: { user_id: userId },
      data: updateData
    });
  },

  async delete(userId: string) {
    return prisma.appuser.delete({
      where: { user_id: userId }
    });
  }
};