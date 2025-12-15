import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type NotificationType = 'LIKE' | 'FOLLOW' | 'COMMENT';

@Entity('notifications')
@Index(['userId', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index()
  userId!: string;

  @Column({ type: 'varchar' })
  type!: NotificationType;

  @Column({ type: 'jsonb', default: {} })
  payload!: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  isRead!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  // We'll use this later for Kafka idempotency
  @Column({ type: 'varchar', nullable: true, unique: true })
  eventId!: string | null;
}
