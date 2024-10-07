const { OK, NO_CONTENT, CREATED, NOT_FOUND } = require('http-status-codes');
const router = require('express').Router();
const supportRequestService = require('../services/supportRequest.service');
const logger = require('../common/logging');

// Создание нового запроса в поддержку
router.post('/api/support-requests', async (req, res) => {
  try {
    const supportRequestEntity = await supportRequestService.save({
      ...req.body,
      createUserID: req.user._id,
      companyID: req.user.companyID
    });
    res.status(CREATED).send(supportRequestEntity.toResponse());
  } catch (error) {
    logger.error('Ошибка при создании запроса в поддержку:', error);
    res.status(500).send('Ошибка при создании запроса в поддержку');
  }
});

// ... остальные роуты ...

module.exports = router;