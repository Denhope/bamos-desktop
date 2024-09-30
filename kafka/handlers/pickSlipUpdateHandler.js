const { Server } = require('socket.io');

const handlePickSlipUpdate = async (data, io) => {
  console.log('Обработка обновления pickSlip:', data);

  // Отправка уведомления всем подключенным клиентам
  io.emit('pickSlipUpdate', {
    eventType: data.eventType,
    message: data.message,
    pickSlipData: data.pickSlipData
  });

  // Здесь можно добавить дополнительную логику обработки, если необходимо
};

module.exports = { handlePickSlipUpdate };