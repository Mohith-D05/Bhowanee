import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContractStage, UserRole } from '@prisma/client';
import { JwtPayload } from '../auth/auth.service';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    user: JwtPayload,
    filters?: {
      stage?: ContractStage;
      crop?: string;
      district?: string;
      blockId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    // Block admins can only see their block
    if (user.role === UserRole.BLOCK_ADMIN && user.blockId) {
      where.blockId = user.blockId;
    }
    // Farmers can only see their own
    if (user.role === UserRole.FARMER) {
      where.farmerId = user.sub;
    }
    // Apply filters
    if (filters?.stage) where.stage = filters.stage;
    if (filters?.crop) where.crop = filters.crop;
    if (filters?.district) where.district = filters.district;
    if (filters?.blockId && user.role === UserRole.TEAM) where.blockId = filters.blockId;

    const [contracts, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        include: {
          farmer: { select: { id: true, name: true, phone: true, lang: true, status: true } },
          tasks: { orderBy: { due: 'asc' } },
          costs: { orderBy: { date: 'asc' } },
          lots: {
            include: {
              bids: { orderBy: { createdAt: 'desc' }, take: 5 },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.contract.count({ where }),
    ]);

    return { contracts, total, page, limit };
  }

  async findById(id: string, user: JwtPayload) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        farmer: { select: { id: true, name: true, phone: true, lang: true, status: true } },
        tasks: { orderBy: { due: 'asc' } },
        costs: { orderBy: { date: 'asc' } },
        lots: {
          include: {
            bids: { orderBy: { createdAt: 'desc' } },
          },
        },
        disputes: true,
        compliance: true,
        payments: true,
      },
    });

    if (!contract) throw new NotFoundException('Contract not found.');

    // Access check
    if (user.role === UserRole.FARMER && contract.farmerId !== user.sub) {
      throw new ForbiddenException('Access denied.');
    }
    if (user.role === UserRole.BLOCK_ADMIN && user.blockId && contract.blockId !== user.blockId) {
      throw new ForbiddenException('Access denied to this block.');
    }

    return contract;
  }

  async create(data: {
    farmerId: string;
    blockId: string;
    village: string;
    district: string;
    crop: string;
    area: number;
    gat: string;
    leaseStart?: Date;
    leaseEnd?: Date;
    notes?: string;
  }) {
    return this.prisma.contract.create({
      data: {
        ...data,
        stage: ContractStage.NOT_SOWN,
      },
      include: {
        farmer: { select: { id: true, name: true } },
      },
    });
  }

  async updateStage(id: string, stage: ContractStage, user: JwtPayload) {
    const contract = await this.findById(id, user);

    // Only block admin, team can change stage
    if (user.role !== UserRole.BLOCK_ADMIN && user.role !== UserRole.TEAM) {
      throw new ForbiddenException('Only administrators can change contract stage.');
    }

    return this.prisma.contract.update({
      where: { id },
      data: { stage },
    });
  }

  async addTask(contractId: string, label: string, due: Date, user: JwtPayload) {
    await this.findById(contractId, user); // access check
    return this.prisma.task.create({
      data: { contractId, label, due },
    });
  }

  async toggleTask(taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found.');
    return this.prisma.task.update({
      where: { id: taskId },
      data: { done: !task.done },
    });
  }

  async addCost(contractId: string, type: string, amount: number, user: JwtPayload) {
    await this.findById(contractId, user);
    return this.prisma.cost.create({
      data: { contractId, type, amount, date: new Date() },
    });
  }

  async flagIssue(contractId: string, description: string, userId: string) {
    const [dispute] = await this.prisma.$transaction([
      this.prisma.dispute.create({
        data: {
          contractId,
          type: 'Crop issue',
          description,
          raisedById: userId,
          owner: 'Super Admin',
        },
      }),
      this.prisma.contract.update({
        where: { id: contractId },
        data: { stage: ContractStage.ISSUE },
      }),
    ]);
    return dispute;
  }
}
