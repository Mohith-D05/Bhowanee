import { Controller, Get, Post, Patch, Param, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Controller('logistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogisticsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  @Get('pickups')
  @Roles(UserRole.LOGISTICS, UserRole.BLOCK_ADMIN, UserRole.TEAM)
  async getPickups() {
    return this.prisma.pickup.findMany({
      include: {
        lot: { select: { grade: true, weightQt: true } },
        contract: { select: { crop: true, village: true, farmer: { select: { name: true } } } },
        warehouse: { select: { name: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  @Post('pickups')
  @Roles(UserRole.LOGISTICS, UserRole.BLOCK_ADMIN, UserRole.TEAM)
  async schedulePickup(@Body() body: {
    lotId: string; contractId: string; farm: string; warehouseId: string; scheduledAt: string;
  }) {
    return this.prisma.pickup.create({
      data: {
        lotId: body.lotId,
        contractId: body.contractId,
        farm: body.farm,
        warehouseId: body.warehouseId,
        scheduledAt: new Date(body.scheduledAt),
        status: 'SCHEDULED',
      },
    });
  }

  @Get('handoffs')
  @Roles(UserRole.LOGISTICS, UserRole.BLOCK_ADMIN, UserRole.TEAM)
  async getHandoffs() {
    return this.prisma.handoff.findMany({
      include: { lot: { select: { grade: true, weightQt: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('handoffs')
  @Roles(UserRole.LOGISTICS, UserRole.BLOCK_ADMIN, UserRole.TEAM)
  async confirmHandoff(@Body() body: { lotId: string; from: string; to: string; weightQt: number }) {
    const handoff = await this.prisma.$transaction(async (tx) => {
      const h = await tx.handoff.create({ data: body });
      // Update pickup status
      const pickup = await tx.pickup.findFirst({ where: { lotId: body.lotId } });
      if (pickup) {
        await tx.pickup.update({ where: { id: pickup.id }, data: { status: 'DONE' } });
        // Update warehouse fill
        const wh = await tx.warehouse.findUnique({ where: { id: pickup.warehouseId } });
        if (wh) {
          await tx.warehouse.update({
            where: { id: wh.id },
            data: { usedQt: Math.min(wh.capacityQt, wh.usedQt + body.weightQt) },
          });
        }
      }
      return h;
    });

    this.realtime.emitDashboardUpdate('logistics');
    return handoff;
  }

  @Patch('pickups/:id/loss')
  @Roles(UserRole.LOGISTICS, UserRole.TEAM)
  async logLoss(
    @Param('id') id: string,
    @Body() body: { qty: number; reason: string },
  ) {
    const pickup = await this.prisma.pickup.findUnique({ where: { id } });
    if (!pickup) throw new NotFoundException('Pickup not found.');
    return this.prisma.pickup.update({
      where: { id },
      data: { lossQt: (pickup.lossQt || 0) + body.qty, lossReason: body.reason },
    });
  }
}
