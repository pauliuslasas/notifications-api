import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateActionDto } from './dto/create-action.dto';
import { MarkReadDto } from './dto/mark-read.dto';

@Controller()
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post('actions')
  createAction(@Body() body: CreateActionDto) {
    return this.notifications.createAction(body);
  }

  @Get('feed/:userId')
  getFeed(@Param('userId') userId: string, @Query('limit') limit?: string) {
    return this.notifications.getFeed(userId, limit ? Number(limit) : 20);
  }

  @Get('feed/:userId/unread-count')
  getUnreadCount(@Param('userId') userId: string) {
    return this.notifications.getUnreadCount(userId);
  }

  @Post('feed/read')
  markRead(@Body() body: MarkReadDto) {
    return this.notifications.markAsRead(body.userId, body.notificationIds);
}
}
