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
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/auth/auth.types';
import type { CreateNotificationDto } from './dtos/create-notification.dto';
import type { UpdateNotificationDto } from './dtos/update-notification.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    return await this.notificationsService.findByUserId(user.id);
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const notification = await this.notificationsService.findById(id);
    if (!notification) {
      throw new NotFoundException(`Notification ${id} was not found`);
    }
    if (notification.userId !== user.id) {
      throw new ForbiddenException('You can only view your own notifications');
    }
    return notification;
  }

  @Post()
  async create(
    @Body() body: CreateNotificationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const { userId: _clientUserId, ...safeBody } = body;
    void _clientUserId;
    return await this.notificationsService.create({
      ...safeBody,
      userId: user.id,
    });
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateNotificationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.notificationsService.findById(id);
    if (!existing) {
      throw new NotFoundException(`Notification ${id} was not found`);
    }
    if (existing.userId !== user.id) {
      throw new ForbiddenException('You can only update your own notifications');
    }
    const { userId: _clientUserId, ...safeBody } = body;
    void _clientUserId;
    const notification = await this.notificationsService.update(id, safeBody);
    if (!notification) {
      throw new NotFoundException(`Notification ${id} was not found`);
    }
    return notification;
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.notificationsService.findById(id);
    if (!existing) {
      throw new NotFoundException(`Notification ${id} was not found`);
    }
    if (existing.userId !== user.id) {
      throw new ForbiddenException('You can only delete your own notifications');
    }
    const notification = await this.notificationsService.delete(id);
    if (!notification) {
      throw new NotFoundException(`Notification ${id} was not found`);
    }
    return notification;
  }
}
