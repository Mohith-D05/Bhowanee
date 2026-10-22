import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.users.findById(user.sub);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() body: { name?: string; lang?: string },
  ) {
    return this.users.updateProfile(user.sub, body);
  }

  @Get('farmers')
  @Roles(UserRole.BLOCK_ADMIN, UserRole.TEAM)
  async listFarmers(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.users.findByRole(UserRole.FARMER, page, limit);
  }

  @Get(':id')
  @Roles(UserRole.TEAM)
  async getUser(@Param('id') id: string) {
    return this.users.findById(id);
  }
}
