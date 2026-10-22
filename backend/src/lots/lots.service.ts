import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LotStatus, ContractStage, UserRole } from '@prisma/client';
import { JwtPayload } from '../auth/auth.service';

@Injectable()
export class LotsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: JwtPayload, filters?: { status?: LotStatus; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 100);
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.status) where.status = filters.status;

    // Block admin: only their block's contracts' lots
    if (user.role === UserRole.BLOCK_ADMIN && user.blockId) {
      where.contract = { blockId: user.blockId };
    }
    if (user.role === UserRole.FARMER) {
      where.contract = { farmerId: user.sub };
    }

    const [lots, total] = await Promise.all([
      this.prisma.lot.findMany({
        where,
        include: {
          contract: {
            select: { id: true, village: true, crop: true, gat: true, farmer: { select: { id: true, name: true } } },
          },
          bids: { orderBy: { price: 'desc' }, take: 1 },
        },
        skip,
        take: limit,
        orderBy: { listedAt: 'desc' },
      }),
      this.prisma.lot.count({ where }),
    ]);
    return { lots, total, page, limit };
  }

  async findById(id: string) {
    const lot = await this.prisma.lot.findUnique({
      where: { id },
      include: {
        contract: { include: { farmer: { select: { id: true, name: true, phone: true } } } },
        bids: { orderBy: { createdAt: 'asc' }, include: { buyer: { select: { id: true, name: true } } } },
      },
    });
    if (!lot) throw new NotFoundException('Lot not found.');
    return lot;
  }

  async create(contractId: string, grade: string, weightQt: number) {
    return this.prisma.$transaction(async (tx) => {
      const lot = await tx.lot.create({
        data: { contractId, grade, weightQt, status: LotStatus.DRAFT },
      });
      await tx.contract.update({
        where: { id: contractId },
        data: { stage: ContractStage.HARVEST },
      });
      return lot;
    });
  }

  async setFarmerPrice(id: string, price: number, user: JwtPayload) {
    const lot = await this.findById(id);
    // Only farmer who owns it or block admin
    if (user.role === UserRole.FARMER && lot.contract.farmer.id !== user.sub) {
      throw new ForbiddenException('Not your lot.');
    }
    return this.prisma.lot.update({
      where: { id },
      data: { farmerPrice: price, status: LotStatus.OPEN },
    });
  }

  async getOpenLots() {
    return this.prisma.lot.findMany({
      where: { status: { in: [LotStatus.OPEN, LotStatus.DRAFT] } },
      include: {
        contract: { select: { id: true, village: true, crop: true, gat: true, district: true, farmer: { select: { name: true } } } },
        bids: { orderBy: { price: 'desc' }, take: 1 },
      },
      orderBy: { listedAt: 'desc' },
    });
  }
}
