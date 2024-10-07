import { SupportRequest, ISupportRequest } from '../models/SupportRequest';
import { Kafka } from 'kafkajs';
import { KAFKA_HOST, KAFKA_PORT } from '../common/config';

const kafka = new Kafka({
  clientId: 'support-request-service',
  brokers: [`${KAFKA_HOST}:${KAFKA_PORT}`],
});

const producer = kafka.producer();

export const supportRequestService = {
  async save(data: Partial<ISupportRequest>): Promise<ISupportRequest> {
    const supportRequest = new SupportRequest(data);
    await supportRequest.save();
    
    await producer.connect();
    await producer.send({
      topic: 'support-request-created',
      messages: [{ value: JSON.stringify(supportRequest) }],
    });
    await producer.disconnect();

    return supportRequest;
  },

  async getAll(companyID: string): Promise<ISupportRequest[]> {
    return SupportRequest.find({ companyID });
  },

  async getById(id: string): Promise<ISupportRequest | null> {
    return SupportRequest.findById(id);
  },

  async update(id: string, data: Partial<ISupportRequest>): Promise<ISupportRequest | null> {
    const updatedRequest = await SupportRequest.findByIdAndUpdate(id, data, { new: true });
    
    if (updatedRequest) {
      await producer.connect();
      await producer.send({
        topic: 'support-request-updated',
        messages: [{ value: JSON.stringify(updatedRequest) }],
      });
      await producer.disconnect();
    }

    return updatedRequest;
  },

  async remove(id: string): Promise<void> {
    await SupportRequest.findByIdAndDelete(id);
    
    await producer.connect();
    await producer.send({
      topic: 'support-request-deleted',
      messages: [{ value: id }],
    });
    await producer.disconnect();
  },
};