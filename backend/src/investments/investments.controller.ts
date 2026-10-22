import { Controller, Get, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { UserRole } from '@prisma/client';

@Controller('investments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvestmentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles(UserRole.INVESTOR, UserRole.TEAM)
  async findAll(@CurrentUser() user: JwtPayload) {
    const where = user.role === UserRole.INVESTOR ? { investorId: user.sub } : {};
    return this.prisma.investment.findMany({ where, include: { plan: true }, orderBy: { createdAt: 'desc' } });
  }

  @Post()
  @Roles(UserRole.INVESTOR)
  async invest(
    @CurrentUser() user: JwtPayload,
    @Body() body: { planId: string; amount: number },
  ) {
    const plan = await this.prisma.plan.findUnique({ where: { id: body.planId } });
    if (!plan) throw new BadRequestException('Plan not found.');
    if (plan.status === 'FULL') throw new BadRequestException('Plan is full.');
    if (body.amount < plan.minInvestment) throw new BadRequestException(`Minimum is ₹${plan.minInvestment.toLocaleString('en-IN')}.`);

    const projectedReturn = Math.round(body.amount * (1 + plan.expectedReturnPct / 100));
    return this.prisma.investment.create({
      data: {
        planId: body.planId,
        investorId: user.sub,
        amount: body.amount,
        stage: 'Pending',
        projectedReturn,
        nextPayout: plan.timelinePayout,
      },
      include: { plan: true },
    });
  }
}
