import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export interface JwtPayload {
  sub: string;
  role: UserRole;
  blockId?: string | null;
  districtId?: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_OTP_ATTEMPTS = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ── OTP-based login (Farmer, Block Admin) ─────────────────

  async requestOtp(phone: string, role: UserRole): Promise<{ message: string }> {
    // Validate phone format
    if (!/^[6-9]\d{9}$/.test(phone)) {
      throw new BadRequestException('Enter a 10-digit mobile number starting with 6, 7, 8 or 9.');
    }

    // Find or create user
    let user = await this.prisma.user.findFirst({
      where: { phone, role },
    });

    if (!user) {
      // Auto-create farmer/block admin on first OTP request
      if (role !== UserRole.FARMER && role !== UserRole.BLOCK_ADMIN) {
        throw new UnauthorizedException('No account found for this phone number.');
      }
      user = await this.prisma.user.create({
        data: {
          phone,
          role,
          name: role === UserRole.FARMER ? 'Farmer' : 'Block Admin',
        },
      });
    }

    // Generate OTP
    const isMock = this.config.get<string>('OTP_MOCK_ENABLED', 'true') === 'true';
    const code = isMock ? '123456' : this.generateSecureOtp();

    // Expire any existing unused OTPs
    await this.prisma.otpCode.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Store new OTP
    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        code: await bcrypt.hash(code, this.SALT_ROUNDS),
        expiresAt: new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000),
      },
    });

    if (!isMock) {
      // TODO: Send SMS via provider
      // await this.smsService.send(phone, `Your Bhowanee code is: ${code}`);
    }

    return { message: `OTP sent to +91 ${phone.slice(0, 2)}xxxxxx${phone.slice(-2)}` };
  }

  async verifyOtp(phone: string, code: string, role: UserRole): Promise<TokenPair> {
    const user = await this.prisma.user.findFirst({
      where: { phone, role },
    });

    if (!user) {
      throw new UnauthorizedException('No account found.');
    }

    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('OTP expired or not found. Request a new one.');
    }

    if (otpRecord.attempts >= this.MAX_OTP_ATTEMPTS) {
      await this.prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { used: true },
      });
      throw new ForbiddenException('Too many attempts. Request a new OTP.');
    }

    // In mock mode, accept "123456" directly
    const isMock = this.config.get<string>('OTP_MOCK_ENABLED', 'true') === 'true';
    let isValid = false;

    if (isMock && code === '123456') {
      isValid = true;
    } else {
      isValid = await bcrypt.compare(code, otpRecord.code);
    }

    if (!isValid) {
      await this.prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = this.MAX_OTP_ATTEMPTS - otpRecord.attempts - 1;
      throw new UnauthorizedException(
        `Invalid OTP. ${remaining} ${remaining === 1 ? 'try' : 'tries'} left.`,
      );
    }

    // Mark OTP as used
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    return this.generateTokenPair(user.id, user.role, user.blockId, user.districtId);
  }

  // ── Email/Password login (Buyer, Investor, Logistics, Storage, Team) ──

  async loginWithPassword(
    email: string,
    password: string,
    role: UserRole,
  ): Promise<TokenPair> {
    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), role },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.generateTokenPair(user.id, user.role, user.blockId, user.districtId);
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }): Promise<{ userId: string }> {
    const existing = await this.prisma.user.findFirst({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new BadRequestException('Email already registered.');
    }

    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        role: data.role,
      },
    });

    return { userId: user.id };
  }

  // ── Token Management ──────────────────────────────────────

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const record = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!record || record.revoked || record.expiresAt < new Date()) {
      // If token was already used (rotation detection), revoke all user tokens
      if (record && !record.revoked) {
        await this.prisma.refreshToken.updateMany({
          where: { userId: record.userId },
          data: { revoked: true },
        });
      }
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    // Rotate: revoke old token
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revoked: true },
    });

    return this.generateTokenPair(
      record.user.id,
      record.user.role,
      record.user.blockId,
      record.user.districtId,
    );
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  // ── Internal helpers ──────────────────────────────────────

  private async generateTokenPair(
    userId: string,
    role: UserRole,
    blockId?: string | null,
    districtId?: string | null,
  ): Promise<TokenPair> {
    const payload: JwtPayload = { sub: userId, role, blockId, districtId };

    const accessToken = this.jwt.sign(payload);

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshExpiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const expiresAt = new Date(
      Date.now() + this.parseDuration(refreshExpiresIn),
    );

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private generateSecureOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days
    const val = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return val * (multipliers[unit] || multipliers['d']);
  }
}
