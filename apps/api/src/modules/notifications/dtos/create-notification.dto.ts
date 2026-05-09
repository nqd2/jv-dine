export type CreateNotificationDto = {
  userId: number;
  content: string;
  isRead?: boolean;
};
