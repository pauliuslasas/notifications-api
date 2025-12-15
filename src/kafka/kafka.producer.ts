import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private producer!: Producer;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const brokers = (this.config.get<string>('KAFKA_BROKERS') ?? 'localhost:9092').split(',');
    const kafka = new Kafka({ clientId: 'notification-api', brokers });

    this.producer = kafka.producer();
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer?.disconnect();
  }

  async publish(topic: string, key: string, value: object) {
    await this.producer.send({
      topic,
      messages: [{ key, value: JSON.stringify(value) }],
    });
  }
}
