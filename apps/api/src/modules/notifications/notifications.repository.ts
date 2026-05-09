import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { UpdateNotificationDto } from './dtos/update-notification.dto';
import { NotificationModel } from './models/notification.model';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<NotificationModel[]> {
    const notifications = await this.prisma.notification.findMany({
      orderBy: { created_at: 'desc' },
    });

    return notifications.map((notification) => this.toModel(notification));
  }

  async findByUserId(userId: number): Promise<NotificationModel[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    return notifications.map((notification) => this.toModel(notification));
  }

  async findById(id: number): Promise<NotificationModel | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    return notification ? this.toModel(notification) : null;
  }

  async create(data: CreateNotificationDto): Promise<NotificationModel> {
    const notification = await this.prisma.notification.create({
      data: {
        user_id: data.userId,
        content: data.content,
        is_read: data.isRead,
      },
    });

    return this.toModel(notification);
  }

  async update(
    id: number,
    data: UpdateNotificationDto,
  ): Promise<NotificationModel | null> {
    const exists = await this.exists(id);
    if (!exists) {
      return null;
    }

    const notification = await this.prisma.notification.update({
      where: { id },
      data: {
        user_id: data.userId,
        content: data.content,
        is_read: data.isRead,
      },
    });

    return this.toModel(notification);
  }

  async delete(id: number): Promise<NotificationModel | null> {
    const exists = await this.exists(id);
    if (!exists) {
      return null;
    }

    const notification = await this.prisma.notification.delete({
      where: { id },
    });
    return this.toModel(notification);
  }

  private async exists(id: number): Promise<boolean> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      select: { id: true },
    });
    return notification !== null;
  }

  private toModel(notification: {
    id: number;
    user_id: number;
    content: string;
    is_read: boolean;
    created_at: Date;
  }): NotificationModel {
    return {
      id: notification.id,
      userId: notification.user_id,
      content: notification.content,
      isRead: notification.is_read,
      createdAt: notification.created_at.toISOString(),
    };
  }
}
