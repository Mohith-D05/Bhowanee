import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../auth/auth.service';
import { UserRole, LotStatus, ContractStage } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** Admin overview KPIs — aggregated from DB */
  async getAdminOverview() {
    const [
      totalContracts,
      totalFarmers,
      totalAcres,
      openBids,
      openDisputes,
      totalPaymentsPending,
      totalPaymentsSettled,
      kycPending,
      contractsByStage,
      contractsByCrop,
    ] = await Promise.all([
      this.prisma.contract.count(),
      this.prisma.user.count({ where: { role: UserRole.FARMER } }),
      this.prisma.contract.aggregate({ _sum: { area: true } }),
      this.prisma.lot.count({ where: { status: LotStatus.OPEN } }),
      this.prisma.dispute.count({ where: { status: 'OPEN' } }),
      this.prisma.payment.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true }, _count: true }),
      this.prisma.payment.aggregate({ where: { status: 'SETTLED' }, _sum: { amount: true }, _count: true }),
      this.prisma.kycSubmission.count({ where: { status: 'PENDING' } }),
      this.prisma.contract.groupBy({ by: ['stage'], _count: true }),
      this.prisma.contract.groupBy({ by: ['crop'], _count: true, _sum: { area: true } }),
    ]);

    return {
      totalContracts,
      totalFarmers,
      totalAcres: totalAcres._sum.area || 0,
      openBids,
      openDisputes,
      kycPending,
      payments: {
        pending: { count: totalPaymentsPending._count, amount: totalPaymentsPending._sum.amount || 0 },
        settled: { count: totalPaymentsSettled._count, amount: totalPaymentsSettled._sum.amount || 0 },
      },
      contractsByStage: contractsByStage.map((s) => ({
        stage: s.stage,
        count: s._count,
      })),
      contractsByCrop: contractsByCrop.map((c) => ({
        crop: c.crop,
        count: c._count,
        acres: c._sum.area || 0,
      })),
    };
  }

  /** District-level stats */
  async getDistrictStats() {
    return this.prisma.districtStats.findMany({
      include: { district: true },
    });
  }

  /** Block admin dashboard — scoped to their block */
  async getBlockDashboard(blockId: string) {
    const [contracts, lots, disputes, payments] = await Promise.all([
      this.prisma.contract.groupBy({
        by: ['stage'],
        where: { blockId },
        _count: true,
      }),
      this.prisma.lot.findMany({
        where: { contract: { blockId }, status: { in: [LotStatus.OPEN, LotStatus.DRAFT] } },
        include: {
          contract: { select: { crop: true, village: true, gat: true, farmer: { select: { name: true } } } },
          bids: { orderBy: { price: 'desc' }, take: 1 },
        },
      }),
      this.prisma.dispute.count({ where: { contract: { blockId }, status: 'OPEN' } }),
      this.prisma.payment.aggregate({ where: { contract: { blockId } }, _sum: { amount: true } }),
    ]);

    return {
      contractsByStage: contracts,
      openLots: lots,
      openDisputes: disputes,
      totalPayments: payments._sum.amount || 0,
    };
  }

  /** Buyer dashboard KPIs */
  async getBuyerDashboard(buyerId: string) {
    const [activeBids, wonLots, totalSpent] = await Promise.all([
      this.prisma.bid.count({ where: { buyerId } }),
      this.prisma.lot.count({ where: { status: LotStatus.CLOSED, bids: { some: { buyerId } } } }),
      this.prisma.payment.aggregate({ where: { fromName: { not: '' } }, _sum: { amount: true } }),
    ]);

    const openLots = await this.prisma.lot.findMany({
      where: { status: LotStatus.OPEN },
      include: {
        contract: { select: { crop: true, village: true, gat: true, district: true } },
        bids: { orderBy: { price: 'desc' }, take: 1 },
      },
    });

    return { activeBids, wonLots, totalSpent: totalSpent._sum.amount || 0, openLots };
  }

  /** Investor dashboard */
  async getInvestorDashboard(investorId: string) {
    const investments = await this.prisma.investment.findMany({
      where: { investorId },
      include: { plan: true },
    });

    const totalDeployed = investments.reduce((sum, i) => sum + i.amount, 0);
    const projectedReturn = investments.reduce((sum, i) => sum + (i.projectedReturn || 0), 0);
    const actualReturn = investments
      .filter((i) => i.actualReturn !== null)
      .reduce((sum, i) => sum + (i.actualReturn || 0), 0);

    const plans = await this.prisma.plan.findMany({ orderBy: { createdAt: 'desc' } });

    return {
      totalDeployed,
      projectedReturn,
      actualReturn,
      irr: totalDeployed > 0 ? ((projectedReturn - totalDeployed) / totalDeployed) * 100 : 0,
      investments,
      plans,
    };
  }

  /** Logistics dashboard */
  async getLogisticsDashboard() {
    const [pickups, warehouses] = await Promise.all([
      this.prisma.pickup.findMany({
        include: {
          lot: { select: { grade: true, weightQt: true } },
          contract: { select: { crop: true, village: true } },
          warehouse: { select: { name: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      }),
      this.prisma.warehouse.findMany(),
    ]);

    return {
      pickups,
      warehouses,
      scheduled: pickups.filter((p) => p.status === 'SCHEDULED').length,
      pending: pickups.filter((p) => p.status === 'PENDING').length,
      done: pickups.filter((p) => p.status === 'DONE').length,
    };
  }

  /** Storage dashboard */
  async getStorageDashboard() {
    const warehouses = await this.prisma.warehouse.findMany();
    const totalCapacity = warehouses.reduce((s, w) => s + w.capacityQt, 0);
    const totalUsed = warehouses.reduce((s, w) => s + w.usedQt, 0);

    return {
      warehouses,
      totalCapacity,
      totalUsed,
      available: totalCapacity - totalUsed,
      utilizationPct: totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0,
    };
  }

  /** Demand & supply chart data */
  async getDemandSupply() {
    const stats = await this.prisma.districtStats.findMany({
      include: { district: { select: { name: true } } },
    });
    return stats.map((s) => ({
      district: s.district.name,
      districtId: s.districtId,
      demandQt: s.demandQt,
      supplyQt: s.supplyQt,
      gap: s.demandQt - s.supplyQt,
    }));
  }
}
