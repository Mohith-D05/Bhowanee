import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Controller('disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisputesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  @Get()
  @Roles(UserRole.TEAM, UserRole.BLOCK_ADMIN)
  async findAll() {
    return this.prisma.dispute.findMany({
      include: { contract: { select: { crop: true, village: true, farmer: { select: { name: true } } } }, raisedBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch(':id/resolve')
  @Roles(UserRole.TEAM)
  async resolve(@Param('id') id: string, @Body('resolution') resolution: string) {
    const dispute = await this.prisma.dispute.update({
      where: { id },
      data: { status: 'RESOLVED', resolution, resolvedAt: new Date() },
    });
    this.realtime.emitDisputeResolved(id);
    this.realtime.emitDashboardUpdate('disputes');
    return dispute;
  }
}
