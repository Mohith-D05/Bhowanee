import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContractsModule } from './contracts/contracts.module';
import { LotsModule } from './lots/lots.module';
import { BidsModule } from './bids/bids.module';
import { PlansModule } from './plans/plans.module';
import { InvestmentsModule } from './investments/investments.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { LogisticsModule } from './logistics/logistics.module';
import { DisputesModule } from './disputes/disputes.module';
import { PaymentsModule } from './payments/payments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RealtimeModule } from './realtime/realtime.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    RealtimeModule,
    AuthModule,
    UsersModule,
    ContractsModule,
    LotsModule,
    BidsModule,
    PlansModule,
    InvestmentsModule,
    WarehousesModule,
    LogisticsModule,
    DisputesModule,
    PaymentsModule,
    DashboardModule,
    HealthModule,
  ],
})
export class AppModule {}
