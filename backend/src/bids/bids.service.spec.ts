import { Test, TestingModule } from '@nestjs/testing';
import { BidsService } from './bids.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LotStatus, ContractStage } from '@prisma/client';

describe('BidsService', () => {
  let service: BidsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      bid: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      lot: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      contract: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<BidsService>(BidsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('placeBid', () => {
    it('throws NotFoundException if lot does not exist', async () => {
      prisma.lot.findUnique.mockResolvedValue(null);
      await expect(service.placeBid('invalid-lot', 'buyer-1', 2000)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if lot is not open', async () => {
      prisma.lot.findUnique.mockResolvedValue({ id: 'l1', status: LotStatus.CLOSED });
      await expect(service.placeBid('l1', 'buyer-1', 2000)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if price is zero or negative', async () => {
      prisma.lot.findUnique.mockResolvedValue({ id: 'l1', status: LotStatus.OPEN });
      await expect(service.placeBid('l1', 'buyer-1', 0)).rejects.toThrow(BadRequestException);
    });

    it('places a bid without auto-closing if price < farmerPrice', async () => {
      prisma.lot.findUnique.mockResolvedValue({
        id: 'l1',
        status: LotStatus.OPEN,
        farmerPrice: 2200,
        weightQt: 50,
        contractId: 'c1',
      });
      const createdBid = { id: 'b1', lotId: 'l1', buyerId: 'buyer-1', price: 2100, buyer: { id: 'buyer-1', name: 'Anil Merchant' } };
      prisma.bid.create.mockResolvedValue(createdBid);

      const result = await service.placeBid('l1', 'buyer-1', 2100);
      expect(result.closed).toBe(false);
      expect(result.payment).toBeNull();
      expect(result.bid.price).toBe(2100);
      expect(prisma.lot.update).not.toHaveBeenCalled();
    });

    it('auto-closes lot and creates payment if bid price >= farmerPrice', async () => {
      prisma.lot.findUnique.mockResolvedValue({
        id: 'l1',
        status: LotStatus.OPEN,
        farmerPrice: 2000,
        weightQt: 50,
        contractId: 'c1',
      });
      const createdBid = { id: 'b1', lotId: 'l1', buyerId: 'buyer-1', price: 2050, buyer: { id: 'buyer-1', name: 'Anil Merchant' } };
      prisma.bid.create.mockResolvedValue(createdBid);
      prisma.lot.update.mockResolvedValue({ id: 'l1', status: LotStatus.CLOSED });
      prisma.contract.update.mockResolvedValue({ id: 'c1', stage: ContractStage.CLOSED });
      prisma.contract.findUnique.mockResolvedValue({ id: 'c1', farmer: { name: 'Prakash Sonawane' } });
      prisma.payment.create.mockResolvedValue({ id: 'p1', amount: 2050 * 50 });

      const result = await service.placeBid('l1', 'buyer-1', 2050);
      expect(result.closed).toBe(true);
      expect(result.payment).toBeDefined();
      expect(prisma.lot.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'l1' },
          data: expect.objectContaining({ status: LotStatus.CLOSED }),
        })
      );
      expect(prisma.contract.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'c1' },
          data: { stage: ContractStage.CLOSED },
        })
      );
    });
  });

  describe('getHighestBid', () => {
    it('returns highest bid ordered by price desc', async () => {
      const topBid = { id: 'b2', price: 2300, buyer: { name: 'Top Buyer' } };
      prisma.bid.findFirst.mockResolvedValue(topBid);

      const result = await service.getHighestBid('l1');
      expect(result).toEqual(topBid);
      expect(prisma.bid.findFirst).toHaveBeenCalledWith({
        where: { lotId: 'l1' },
        orderBy: { price: 'desc' },
        include: { buyer: { select: { id: true, name: true } } },
      });
    });
  });
});
