import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        phone: true,
        email: true,
        lang: true,
        status: true,
        blockId: true,
        districtId: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  async findByRole(role: UserRole, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { role },
        select: {
          id: true,
          name: true,
          role: true,
          phone: true,
          email: true,
          status: true,
          blockId: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { role } }),
    ]);
    return { users, total, page, limit };
  }

  async updateProfile(id: string, data: { name?: string; lang?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, lang: true },
    });
  }
}
