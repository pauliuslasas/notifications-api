import { ArrayNotEmpty, IsArray, IsString, IsUUID } from 'class-validator';

export class MarkReadDto {
  @IsString()
  userId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  notificationIds!: string[];
}
