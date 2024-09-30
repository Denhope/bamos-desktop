const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Subscription = require('./models/Subscription');
const PickSlip = require('./resources/pickSlips/pickSlip.model'); // Добавьте модель PickSlip

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Подключение к MongoDB
mongoose.connect('mongodb://localhost/your_database', { useNewUrlParser: true, useUnifiedTopology: true });

// Добавьте новый топик для пикслипов в createTopics
const { createTopics } = require('./kafka/kafkaInit');
createTopics(['pickSlipUpdates', /* другие топики */]).catch(error => {
  console.error('Ошибка при создании топиков Kafka:', error);
});

// Модифицируйте функцию runConsumer для обработки сообщений пикслипов
const { runConsumer } = require('./kafka/kafkaConsumer');
runConsumer(io, ['pickSlipUpdates', /* другие топики */]).catch(console.error);

io.on('connection', (socket) => {
  console.log('Новое подключение:', socket.id);

  socket.on('subscribeToPickSlips', async (userId) => {
    try {
      logger.info(`Пользователь ${userId} подписался на обновления пикслипов`);
      const subscription = await Subscription.findOne({ userId, eventType: 'pickSlipUpdate' });
      if (!subscription) {
        await Subscription.create({ userId, eventType: 'pickSlipUpdate' });
      }
      global.userConnections.set(userId, socket);

      // Отправка начальных данных
      const initialPickSlips = await PickSlip.find().sort({ createDate: -1 }).limit(100);
      socket.emit('initialPickSlips', initialPickSlips);
    } catch (error) {
      logger.error('Ошибка при подписке на пикслипы:', error);
    }
  });

  socket.on('unsubscribeFromPickSlips', async (userId) => {
    try {
      logger.info(`Пользователь ${userId} отписался от обновлений пикслипов`);
      await Subscription.deleteOne({ userId, eventType: 'pickSlipUpdate' });
    } catch (error) {
      logger.error('Ошибка при отписке от пикслипов:', error);
    }
  });

  socket.on('getInitialPickSlips', async () => {
    try {
      const pickSlips = await PickSlip.find().sort({ createDate: -1 }).limit(100);
      socket.emit('initialPickSlips', pickSlips);
    } catch (error) {
      console.error('Ошибка при получении начальных данных:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Отключение:', socket.id);
  });

  socket.on('getPickSlips', async (userId) => {
    try {
      const pickSlips = await PickSlip.find().sort({ createDate: -1 }).limit(100);
      socket.emit('pickSlipsData', pickSlips);
    } catch (error) {
      logger.error('Ошибка при получении данных пикслипов:', error);
    }
  });
});

// Функция для отправки уведомлений об обновлении пикслипов через Kafka
async function sendPickSlipUpdateNotificationToKafka() {
  try {
    await sendMessage('pickSlipUpdates', JSON.stringify({ type: 'UPDATE_NOTIFICATION' }));
    logger.info('Уведомление об обновлении пикслипов отправлено в Kafka');
  } catch (error) {
    logger.error('Ошибка при отправке уведомления об обновлении пикслипов в Kafka:', error);
  }
}

// Отслеживание изменений в коллекции пикслипов
const pickSlipChangeStream = PickSlip.watch();
pickSlipChangeStream.on('change', async (change) => {
  if (change.operationType === 'insert' || change.operationType === 'update' || change.operationType === 'replace') {
    sendPickSlipUpdateNotificationToKafka();
  }
});

server.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});