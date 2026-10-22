import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { UserRole, ContractStage } from '@prisma/client';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(private readonly contracts: ContractsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('stage') stage?: ContractStage,
    @Query('crop') crop?: string,
    @Query('district') district?: string,
    @Query('blockId') blockId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.contracts.findAll(user, { stage, crop, district, blockId, page, limit });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.contracts.findById(id, user);
  }

  @Post()
  @Roles(UserRole.BLOCK_ADMIN, UserRole.TEAM)
  async create(@Body() body: {
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
    return this.contracts.create(body);
  }

  @Patch(':id/stage')
  @Roles(UserRole.BLOCK_ADMIN, UserRole.TEAM)
  async updateStage(
    @Param('id') id: string,
    @Body('stage') stage: ContractStage,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contracts.updateStage(id, stage, user);
  }

  @Post(':id/tasks')
  @Roles(UserRole.BLOCK_ADMIN, UserRole.TEAM)
  async addTask(
    @Param('id') id: string,
    @Body() body: { label: string; due: Date },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contracts.addTask(id, body.label, body.due, user);
  }

  @Patch('tasks/:taskId/toggle')
  async toggleTask(@Param('taskId') taskId: string) {
    return this.contracts.toggleTask(taskId);
  }

  @Post(':id/costs')
  @Roles(UserRole.BLOCK_ADMIN, UserRole.TEAM)
  async addCost(
    @Param('id') id: string,
    @Body() body: { type: string; amount: number },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contracts.addCost(id, body.type, body.amount, user);
  }

  @Post(':id/flag-issue')
  @Roles(UserRole.BLOCK_ADMIN, UserRole.TEAM)
  async flagIssue(
    @Param('id') id: string,
    @Body('description') description: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contracts.flagIssue(id, description, user.sub);
  }
}
