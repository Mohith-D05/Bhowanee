import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;
  let config: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      otpCode: {
        updateMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    jwt = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    config = {
      get: jest.fn((key, def) => def),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestOtp', () => {
    it('throws BadRequestException for invalid phone format', async () => {
      await expect(service.requestOtp('12345', UserRole.FARMER)).rejects.toThrow(BadRequestException);
    });

    it('generates OTP for existing user', async () => {
      const mockUser = { id: 'user-1', phone: '9876543210', role: UserRole.FARMER };
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.otpCode.updateMany.mockResolvedValue({ count: 1 });
      prisma.otpCode.create.mockResolvedValue({ id: 'otp-1' });

      const res = await service.requestOtp('9876543210', UserRole.FARMER);
      expect(res.message).toContain('OTP sent to +91 98xxxxxx10');
      expect(prisma.otpCode.create).toHaveBeenCalled();
    });

    it('auto-creates farmer user on first OTP request', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      const newUser = { id: 'user-new', phone: '9123456789', role: UserRole.FARMER, name: 'Farmer' };
      prisma.user.create.mockResolvedValue(newUser);
      prisma.otpCode.updateMany.mockResolvedValue({ count: 0 });
      prisma.otpCode.create.mockResolvedValue({ id: 'otp-new' });

      const res = await service.requestOtp('9123456789', UserRole.FARMER);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(res.message).toBeDefined();
    });
  });

  describe('verifyOtp', () => {
    it('throws UnauthorizedException if user does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.verifyOtp('9876543210', '123456', UserRole.FARMER)).rejects.toThrow(UnauthorizedException);
    });
  });
});
