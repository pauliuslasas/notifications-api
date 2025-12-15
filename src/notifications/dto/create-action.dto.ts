import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import * as notificationEntity from '../notification.entity';

export class CreateActionDto {
  @IsString()
  userId!: string;

  @IsEnum(['LIKE', 'FOLLOW', 'COMMENT'])
  type!: notificationEntity.NotificationType;

  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;
}
