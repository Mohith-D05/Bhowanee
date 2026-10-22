import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { UserRole } from '@prisma/client';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('admin')
  @Roles(UserRole.TEAM)
  async adminOverview() {
    return this.dashboard.getAdminOverview();
  }

  @Get('districts')
  @Roles(UserRole.TEAM)
  async districtStats() {
    return this.dashboard.getDistrictStats();
  }

  @Get('demand-supply')
  @Roles(UserRole.TEAM, UserRole.BUYER)
  async demandSupply() {
    return this.dashboard.getDemandSupply();
  }

  @Get('block')
  @Roles(UserRole.BLOCK_ADMIN)
  async blockDashboard(@CurrentUser() user: JwtPayload) {
    if (!user.blockId) return { error: 'No block assigned.' };
    return this.dashboard.getBlockDashboard(user.blockId);
  }

  @Get('buyer')
  @Roles(UserRole.BUYER)
  async buyerDashboard(@CurrentUser() user: JwtPayload) {
    return this.dashboard.getBuyerDashboard(user.sub);
  }

  @Get('investor')
  @Roles(UserRole.INVESTOR)
  async investorDashboard(@CurrentUser() user: JwtPayload) {
    return this.dashboard.getInvestorDashboard(user.sub);
  }

  @Get('logistics')
  @Roles(UserRole.LOGISTICS)
  async logisticsDashboard() {
    return this.dashboard.getLogisticsDashboard();
  }

  @Get('storage')
  @Roles(UserRole.STORAGE)
  async storageDashboard() {
    return this.dashboard.getStorageDashboard();
  }
}
