import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: UserRole;
  userBlockId?: string | null;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // Configured properly in production
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private connectedClients = new Map<string, AuthenticatedSocket>();

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Authenticate via token in handshake query or auth header
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token as string ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const secret = this.config.get<string>('JWT_ACCESS_SECRET', 'dev-access-secret-change-me');
      const payload = this.jwt.verify(token, { secret });

      client.userId = payload.sub;
      client.userRole = payload.role;
      client.userBlockId = payload.blockId;

      // Join role-based room
      client.join(`role:${payload.role}`);

      // Join block-specific room if applicable
      if (payload.blockId) {
        client.join(`block:${payload.blockId}`);
      }

      // Join user-specific room
      client.join(`user:${payload.sub}`);

      this.connectedClients.set(client.id, client);

      console.log(`🔌 Client connected: ${client.id} (${payload.role})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connectedClients.delete(client.id);
    console.log(`🔌 Client disconnected: ${client.id}`);
  }

  // Client can subscribe to specific lot updates
  @SubscribeMessage('subscribe:lot')
  handleSubscribeLot(client: AuthenticatedSocket, lotId: string) {
    client.join(`lot:${lotId}`);
  }

  @SubscribeMessage('unsubscribe:lot')
  handleUnsubscribeLot(client: AuthenticatedSocket, lotId: string) {
    client.leave(`lot:${lotId}`);
  }

  // ── Event Emitters (called by controllers AFTER DB commit) ──

  /** Bid placed on a lot */
  emitBidPlaced(bid: any) {
    const payload = {
      eventId: this.eventId(),
      lotId: bid.lotId,
      bidId: bid.id,
      price: bid.price,
      buyerName: bid.buyer?.name || 'Buyer',
      timestamp: bid.createdAt || new Date().toISOString(),
    };
    this.server.emit('bid.placed', payload);
  }

  /** Lot closed (bid matched farmer price or manually accepted) */
  emitLotClosed(lotId: string, bid: any, payment: any) {
    this.server.emit('lot.closed', {
      eventId: this.eventId(),
      lotId,
      bidId: bid.id,
      price: bid.price,
      paymentId: payment?.id,
      timestamp: new Date().toISOString(),
    });
  }

  /** Farmer price changed on a lot */
  emitPriceChanged(lotId: string, price: number) {
    const payload = {
      eventId: this.eventId(),
      lotId,
      price,
      timestamp: new Date().toISOString(),
    };
    this.server.emit('lot.price.changed', payload);
  }

  /** New lot created */
  emitLotCreated(lot: any) {
    this.server.emit('lot.created', {
      eventId: this.eventId(),
      lotId: lot.id,
      contractId: lot.contractId,
      grade: lot.grade,
      weightQt: lot.weightQt,
      timestamp: new Date().toISOString(),
    });
  }

  /** Contract stage changed */
  emitContractUpdated(contractId: string, stage: string) {
    this.server.emit('contract.updated', {
      eventId: this.eventId(),
      contractId,
      stage,
      timestamp: new Date().toISOString(),
    });
  }

  /** Dashboard metrics need refresh */
  emitDashboardUpdate(category: string) {
    this.server.emit('dashboard.metrics.updated', {
      eventId: this.eventId(),
      category,
      timestamp: new Date().toISOString(),
    });
  }

  /** Payment settled */
  emitPaymentSettled(paymentId: string) {
    this.server.emit('payment.settled', {
      eventId: this.eventId(),
      paymentId,
      timestamp: new Date().toISOString(),
    });
  }

  /** Dispute resolved */
  emitDisputeResolved(disputeId: string) {
    this.server.emit('dispute.resolved', {
      eventId: this.eventId(),
      disputeId,
      timestamp: new Date().toISOString(),
    });
  }

  /** KYC approved */
  emitKycApproved(kycId: string) {
    this.server.emit('kyc.approved', {
      eventId: this.eventId(),
      kycId,
      timestamp: new Date().toISOString(),
    });
  }

  /** Notification */
  emitNotification(userId: string, message: string, type = 'info') {
    this.server.to(`user:${userId}`).emit('notification.created', {
      eventId: this.eventId(),
      message,
      type,
      timestamp: new Date().toISOString(),
    });
  }

  private eventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
