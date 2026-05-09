import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { UpdateNotificationDto } from './dtos/update-notification.dto';
import { NotificationModel } from './models/notification.model';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  findAll(): Promise<NotificationModel[]> {
    return this.notificationsRepository.findAll();
  }

  findByUserId(userId: number): Promise<NotificationModel[]> {
    return this.notificationsRepository.findByUserId(userId);
  }

  findById(id: number): Promise<NotificationModel | null> {
    return this.notificationsRepository.findById(id);
  }

  create(data: CreateNotificationDto): Promise<NotificationModel> {
    return this.notificationsRepository.create(data);
  }

  update(
    id: number,
    data: UpdateNotificationDto,
  ): Promise<NotificationModel | null> {
    return this.notificationsRepository.update(id, data);
  }

  delete(id: number): Promise<NotificationModel | null> {
    return this.notificationsRepository.delete(id);
  }
}
