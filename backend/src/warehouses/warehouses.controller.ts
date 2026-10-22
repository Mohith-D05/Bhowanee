import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('warehouses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehousesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll() {
    return this.prisma.warehouse.findMany();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.prisma.warehouse.findUnique({ where: { id } });
  }

  @Post()
  @Roles(UserRole.STORAGE, UserRole.TEAM)
  async create(@Body() body: { name: string; lat?: number; lng?: number; capacityQt: number; contact?: string }) {
    return this.prisma.warehouse.create({ data: body });
  }
}
