import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import { RedisService } from '../redis/redis.service';
import { KafkaProducerService } from 'src/kafka/kafka.producer';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    private readonly redis: RedisService,
    private readonly kafka: KafkaProducerService
  ) {}

  private feedKey(userId: string) {
    return `feed:${userId}`;
  }

  async createAction(input: { userId: string; type: NotificationType; payload?: Record<string, any> }) {
    const event = {
      eventId: uuidv4(),
      userId: input.userId,
      type: input.type,
      payload: input.payload ?? {},
      createdAt: new Date().toISOString(),
    };

    await this.kafka.publish('user.activity', input.userId, event);

  return { accepted: true, eventId: event.eventId };
}

  async getFeed(userId: string, limit = 20) {
    const key = this.feedKey(userId);

    // 1) Try cache
    const cached = await this.redis.get(key);
    if (cached) {
      console.log('FEED CACHE HIT', userId);
      const parsed = JSON.parse(cached) as Notification[];
      return parsed.slice(0, limit);
    } else {
      console.log('FEED CACHE MISS', userId);
    }

    // 2) Cache miss -> DB
    const rows = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    // 3) Store in cache (TTL 30s to keep it simple)
    await this.redis.set(key, JSON.stringify(rows), 30);

    return rows;
  }

  private unreadKey(userId: string) {
    return `unread_count:${userId}`;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const key = this.unreadKey(userId);

    // 1) Try Redis
    const cached = await this.redis.get(key);
    if (cached !== null) {
      const n = Number(cached);
      return Number.isFinite(n) ? n : 0;
    }

    // 2) Cache miss -> DB
    const count = await this.repo.count({
      where: { userId, isRead: false },
    });

    // 3) Store in cache (TTL: 60s is fine)
    await this.redis.set(key, String(count), 60);

    return count;
  }

  async markAsRead(userId: string, notificationIds: string[]) {
  const res = await this.repo.update(
    { userId, id: In(notificationIds), isRead: false },
    { isRead: true },
  );

  // always invalidate caches
  await this.redis.del(`feed:${userId}`);
  await this.redis.del(`unread_count:${userId}`);

  return { updated: res.affected ?? 0 };
}

}
