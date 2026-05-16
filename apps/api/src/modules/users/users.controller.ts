import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/auth/auth.types';
import type { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async findMe(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.usersService.findById(user.id);
    if (!profile) {
      throw new NotFoundException(`User ${user.id} was not found`);
    }
    return profile;
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (id !== user.id) {
      throw new ForbiddenException('You can only view your own profile');
    }
    const profile = await this.usersService.findById(id);
    if (!profile) {
      throw new NotFoundException(`User ${id} was not found`);
    }
    return profile;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (id !== user.id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    const { roleId: _roleId, isVerified: _isVerified, ...safeBody } = body;
    void _roleId;
    void _isVerified;
    const updated = await this.usersService.update(id, safeBody);
    if (!updated) {
      throw new NotFoundException(`User ${id} was not found`);
    }
    return updated;
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (id !== user.id) {
      throw new ForbiddenException('You can only delete your own account');
    }
    const deleted = await this.usersService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User ${id} was not found`);
    }
    return deleted;
  }
}
