import { Kafka, Producer } from 'kafkajs';
import { KAFKA_PORT, KAFKA_HOST } from '../common/config';

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: [`${KAFKA_HOST}:${KAFKA_PORT}`]
});

const producer: Producer = kafka.producer();

export const runProducer = async (): Promise<void> => {
  await producer.connect();
  console.log('Kafka Producer connected');
};

export const sendMessage = async <T>(topic: string, message: T): Promise<void> => {
  try {
    await producer.send({
      topic,
      messages: [
        { value: JSON.stringify(message) },
      ],
    });
    console.log(`Сообщение отправлено в топик ${topic}:`, message);
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    throw error;
  }
};