import { Router } from 'express';
import { OK, NO_CONTENT, CREATED, NOT_FOUND } from 'http-status-codes';
import { SupportRequest, ISupportRequest } from '../models/SupportRequest';
import { KAFKA_ENABLED } from '../common/config';
import logger from '../common/logging';
import { sendMessage } from '../kafka/kafkaProducer'; // Импортируем функцию sendMessage

const router = Router();

// Создание нового запроса в поддержку
router.post('/api/support-requests', async (req, res) => {
  try {
    const supportRequest = new SupportRequest({
      ...req.body,
      createUserID: req.user._id,
      companyID: req.user.companyID
    });
    await supportRequest.save();

    if (KAFKA_ENABLED === 'true') {
      try {
        await sendMessage('support-request-topic', {
          action: 'created',
          supportRequest
        });
        logger.info('Сообщение о создании запроса отправлено в Kafka');
      } catch (kafkaError) {
        logger.error('Ошибка при отправке сообщения в Kafka:', kafkaError);
      }
    }

    res.status(CREATED).send(supportRequest.toResponse());
  } catch (error) {
    logger.error('Ошибка при создании запроса в поддержку:', error);
    res.status(500).send('Ошибка при создании запроса в поддержку');
  }
});

// Получение всех запросов в поддержку для компании
router.get('/api/support-requests', async (req, res) => {
  try {
    const companyID = req.user.companyID;
    const supportRequests = await SupportRequest.find({ companyID });
    res.status(OK).send(supportRequests.map(req => req.toResponse()));
  } catch (error) {
    logger.error('Ошибка при получении запросов в поддержку:', error);
    res.status(500).send('Ошибка при получении запросов в поддержку');
  }
});

// Получение конкретного запроса в поддержку
router.get('/api/support-requests/:id', async (req, res) => {
  try {
    const supportRequest = await SupportRequest.findById(req.params.id);
    if (supportRequest) {
      res.status(OK).send(supportRequest.toResponse());
    } else {
      res.status(NOT_FOUND).send('Запрос в поддержку не найден');
    }
  } catch (error) {
    logger.error('Ошибка при получении запроса в поддержку:', error);
    res.status(500).send('Ошибка при получении запроса в поддержку');
  }
});

// Обновление запроса в поддержку
router.put('/api/support-requests/:id', async (req, res) => {
  try {
    const updatedRequest = await SupportRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (updatedRequest && KAFKA_ENABLED === 'true') {
      try {
        await sendMessage('support-request-topic', {
          action: 'updated',
          supportRequest: updatedRequest
        });
        logger.info('Сообщение об обновлении запроса отправлено в Kafka');
      } catch (kafkaError) {
        logger.error('Ошибка при отправке сообщения в Kafka:', kafkaError);
      }
    }

    res.status(OK).send(updatedRequest.toResponse());
  } catch (error) {
    logger.error('Ошибка при обновлении запроса в поддержку:', error);
    res.status(500).send('Ошибка при обновлении запроса в поддержку');
  }
});

// Удаление запроса в поддержку
router.delete('/api/support-requests/:id', async (req, res) => {
  try {
    await SupportRequest.findByIdAndDelete(req.params.id);
    
    if (KAFKA_ENABLED === 'true') {
      try {
        await sendMessage('support-request-topic', {
          action: 'deleted',
          id: req.params.id
        });
        logger.info('Сообщение об удалении запроса отправлено в Kafka');
      } catch (kafkaError) {
        logger.error('Ошибка при отправке сообщения в Kafka:', kafkaError);
      }
    }

    res.sendStatus(NO_CONTENT);
  } catch (error) {
    logger.error('Ошибка при удалении запроса в поддержку:', error);
    res.status(500).send('Ошибка при удалении запроса в поддержку');
  }
});

export default router;