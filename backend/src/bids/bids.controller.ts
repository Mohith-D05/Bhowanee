import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { BidsService } from './bids.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { UserRole } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Controller('bids')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BidsController {
  constructor(
    private readonly bids: BidsService,
    private readonly realtime: RealtimeGateway,
  ) {}

  @Get('lot/:lotId')
  async getBidsByLot(@Param('lotId') lotId: string) {
    return this.bids.getBidsByLot(lotId);
  }

  @Get('lot/:lotId/highest')
  async getHighestBid(@Param('lotId') lotId: string) {
    return this.bids.getHighestBid(lotId);
  }

  @Post()
  @Roles(UserRole.BUYER, UserRole.TEAM)
  async placeBid(
    @Body() body: { lotId: string; price: number },
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.bids.placeBid(body.lotId, user.sub, body.price);

    // Emit real-time event AFTER successful DB commit
    this.realtime.emitBidPlaced(result.bid);
    if (result.closed) {
      this.realtime.emitLotClosed(body.lotId, result.bid, result.payment);
      this.realtime.emitDashboardUpdate('bids');
    }

    return result;
  }

  @Post(':lotId/accept/:bidId')
  @Roles(UserRole.BLOCK_ADMIN, UserRole.TEAM)
  async acceptBid(
    @Param('lotId') lotId: string,
    @Param('bidId') bidId: string,
  ) {
    const result = await this.bids.acceptBid(lotId, bidId);

    // Emit after successful commit
    this.realtime.emitLotClosed(lotId, result.bid, result.payment);
    this.realtime.emitDashboardUpdate('bids');

    return result;
  }
}
