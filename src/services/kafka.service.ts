import { Kafka, Producer } from 'kafkajs';
import { KAFKA_HOST, KAFKA_PORT, KAFKA_ENABLED } from '../common/config';

class KafkaService {
  private static instance: KafkaService;
  private producer: Producer | null = null;

  private constructor() {
    if (KAFKA_ENABLED === 'true') {
      const kafka = new Kafka({
        clientId: 'support-request-service',
        brokers: [`${KAFKA_HOST}:${KAFKA_PORT}`],
      });
      this.producer = kafka.producer();
    }
  }

  public static getInstance(): KafkaService {
    if (!KafkaService.instance) {
      KafkaService.instance = new KafkaService();
    }
    return KafkaService.instance;
  }

  async connect() {
    if (this.producer && !this.producer.isConnected()) {
      await this.producer.connect();
    }
  }

  async disconnect() {
    if (this.producer && this.producer.isConnected()) {
      await this.producer.disconnect();
    }
  }

  async sendMessage(topic: string, message: any) {
    if (this.producer && this.producer.isConnected()) {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
    }
  }
}

export const kafkaService = KafkaService.getInstance();