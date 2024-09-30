const { Kafka } = require('kafkajs');
const { handlePartRequest } = require('./handlers/partRequestHandler');
const { handleStockCheck } = require('./handlers/stockCheckHandler');
const { handleNotification } = require('./handlers/notificationHandler');
const { handleCacheUpdate } = require('./handlers/cacheUpdateHandler');
const { handlePickSlipUpdate } = require('./handlers/pickSlipUpdateHandler'); // Новый хендлер
const { KAFKA_PORT, KAFKA_HOST } = require('../common/config');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: [`${KAFKA_HOST}:${KAFKA_PORT}`]
});

const consumer = kafka.consumer({ groupId: 'TEST' });

const runConsumer = async (io) => {
  await connectWithRetry();
  await consumer.subscribe({ topic: 'part-requests-topic', fromBeginning: true });
  await consumer.subscribe({ topic: 'stock-check-topic', fromBeginning: true });
  await consumer.subscribe({ topic: 'notification-topic', fromBeginning: true });
  await consumer.subscribe({ topic: 'redis-cache-update-topic', fromBeginning: true });
  await consumer.subscribe({ topic: 'pickSlipUpdates', fromBeginning: true }); // Новый топик

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());
      console.log(`Получено сообщение из топика ${topic}:`, data);

      switch (topic) {
        case 'part-requests-topic':
          await handlePartRequest(data, io);
          break;
        case 'stock-check-topic':
          await handleStockCheck(data, io);
          break;
        case 'notification-topic':
          await handleNotification(data, io);
          break;
        case 'redis-cache-update-topic':
          await handleCacheUpdate(data);
          console.log('newData:', data);
          break;
        case 'pickSlipUpdates':
          await handlePickSlipUpdate(data, io);
          break;
        default:
          console.log('Неизвестный топик:', topic);
      }
    },
  });
};

async function connectWithRetry(retries = 10, delay = 10000) {
  for (let i = 0; i < retries; i++) {
    try {
      await consumer.connect();
      console.log('Kafka Consumer connected');
      return;
    } catch (error) {
      console.error(`Failed to connect to Kafka (attempt ${i + 1} of ${retries}):`, error);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw error;
      }
    }
  }
}

module.exports = { runConsumer };