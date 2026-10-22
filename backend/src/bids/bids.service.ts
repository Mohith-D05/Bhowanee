import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LotStatus, ContractStage } from '@prisma/client';

@Injectable()
export class BidsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBidsByLot(lotId: string) {
    return this.prisma.bid.findMany({
      where: { lotId },
      include: { buyer: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getHighestBid(lotId: string) {
    return this.prisma.bid.findFirst({
      where: { lotId },
      orderBy: { price: 'desc' },
      include: { buyer: { select: { id: true, name: true } } },
    });
  }

  async placeBid(lotId: string, buyerId: string, price: number) {
    const lot = await this.prisma.lot.findUnique({ where: { id: lotId } });
    if (!lot) throw new NotFoundException('Lot not found.');
    if (lot.status !== LotStatus.OPEN) throw new BadRequestException('Lot is not open for bidding.');
    if (price <= 0) throw new BadRequestException('Price must be positive.');

    // Use transaction to ensure consistency
    return this.prisma.$transaction(async (tx) => {
      const bid = await tx.bid.create({
        data: { lotId, buyerId, price },
        include: { buyer: { select: { id: true, name: true } } },
      });

      // Auto-close if bid >= farmer price
      let closed = false;
      let payment = null;
      if (lot.farmerPrice > 0 && price >= lot.farmerPrice) {
        await tx.lot.update({
          where: { id: lotId },
          data: { status: LotStatus.CLOSED, closedBidId: bid.id, closedAt: new Date() },
        });
        await tx.contract.update({
          where: { id: lot.contractId },
          data: { stage: ContractStage.CLOSED },
        });
        // Create payment record
        const contract = await tx.contract.findUnique({
          where: { id: lot.contractId },
          include: { farmer: { select: { name: true } } },
        });
        payment = await tx.payment.create({
          data: {
            contractId: lot.contractId,
            lotId,
            amount: price * lot.weightQt,
            fromName: bid.buyer.name,
            toName: contract?.farmer.name || 'Farmer',
            status: 'PENDING',
          },
        });
        closed = true;
      }

      return { bid, closed, payment };
    });
  }

  async acceptBid(lotId: string, bidId: string) {
    const lot = await this.prisma.lot.findUnique({ where: { id: lotId } });
    if (!lot) throw new NotFoundException('Lot not found.');

    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: { buyer: { select: { name: true } } },
    });
    if (!bid) throw new NotFoundException('Bid not found.');
    if (bid.lotId !== lotId) throw new BadRequestException('Bid does not belong to this lot.');

    return this.prisma.$transaction(async (tx) => {
      await tx.lot.update({
        where: { id: lotId },
        data: { status: LotStatus.CLOSED, closedBidId: bidId, closedAt: new Date() },
      });
      await tx.contract.update({
        where: { id: lot.contractId },
        data: { stage: ContractStage.CLOSED },
      });
      const contract = await tx.contract.findUnique({
        where: { id: lot.contractId },
        include: { farmer: { select: { name: true } } },
      });
      const payment = await tx.payment.create({
        data: {
          contractId: lot.contractId,
          lotId,
          amount: bid.price * lot.weightQt,
          fromName: bid.buyer.name,
          toName: contract?.farmer.name || 'Farmer',
          status: 'PENDING',
        },
      });
      return { lot: { id: lotId, status: 'CLOSED' }, bid, payment };
    });
  }
}
