import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { LotsService } from './lots.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { UserRole, LotStatus } from '@prisma/client';

@Controller('lots')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LotsController {
  constructor(private readonly lots: LotsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: LotStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.lots.findAll(user, { status, page, limit });
  }

  @Get('open')
  async getOpenLots() {
    return this.lots.getOpenLots();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.lots.findById(id);
  }

  @Post()
  @Roles(UserRole.BLOCK_ADMIN, UserRole.TEAM)
  async create(@Body() body: { contractId: string; grade: string; weightQt: number }) {
    return this.lots.create(body.contractId, body.grade, body.weightQt);
  }

  @Patch(':id/price')
  @Roles(UserRole.FARMER, UserRole.BLOCK_ADMIN, UserRole.TEAM)
  async setPrice(
    @Param('id') id: string,
    @Body('price') price: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.lots.setFarmerPrice(id, price, user);
  }
}
