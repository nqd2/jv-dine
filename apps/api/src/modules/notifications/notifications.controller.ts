import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import type { CreateNotificationDto } from './dtos/create-notification.dto';
import type { UpdateNotificationDto } from './dtos/update-notification.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll() {
    return await this.notificationsService.findAll();
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return await this.notificationsService.findByUserId(userId);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const notification = await this.notificationsService.findById(id);
    if (!notification) {
      throw new NotFoundException(`Notification ${id} was not found`);
    }
    return notification;
  }

  @Post()
  async create(@Body() body: CreateNotificationDto) {
    return await this.notificationsService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateNotificationDto,
  ) {
    const notification = await this.notificationsService.update(id, body);
    if (!notification) {
      throw new NotFoundException(`Notification ${id} was not found`);
    }
    return notification;
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const notification = await this.notificationsService.delete(id);
    if (!notification) {
      throw new NotFoundException(`Notification ${id} was not found`);
    }
    return notification;
  }
}
