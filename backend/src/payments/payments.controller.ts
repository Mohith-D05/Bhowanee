import { Controller, Get, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, PaymentStatus } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  @Get()
  @Roles(UserRole.TEAM, UserRole.BLOCK_ADMIN)
  async findAll(@Query('status') status?: PaymentStatus) {
    const where = status ? { status } : {};
    return this.prisma.payment.findMany({
      where,
      include: { contract: { select: { crop: true, village: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch(':id/settle')
  @Roles(UserRole.TEAM)
  async settle(@Param('id') id: string) {
    const payment = await this.prisma.payment.update({
      where: { id },
      data: { status: 'SETTLED', settledAt: new Date() },
    });
    this.realtime.emitPaymentSettled(id);
    this.realtime.emitDashboardUpdate('payments');
    return payment;
  }
}
