import { OrderItem, PickSlipType } from '../models/OrderItem';
import { MONGO_ENTITY_EXISTS_ERROR_CODE, ENTITY_EXISTS, ENTITY_NAME } from '../constants/errorCodes';
import { handleNotification } from '../handlers/notificationHandler';
import { sendMessage } from '../kafka/kafkaProducer';

const save = async (pickSlip: PickSlipType): Promise<PickSlipType | null> => {
  try {
    const pick = await OrderItem.create(pickSlip);
    if (pick) {
      console.log('OrderItem создан:', pick);
      
      const notificationData = {
        eventType: 'newPickSlip',
        message: `НОВЫЙ PICKSLIP: ${pick.pickSlipNumberNew}`,
        pickSlipData: pick
      };

      console.log('Отправка уведомления:', notificationData);
      
      await handleNotification(notificationData, global.io);
      
      await sendMessage('pickSlipUpdates', notificationData);
      
      console.log('Сообщение отправлено в Kafka топик pickSlipUpdates');
    }
    return pick;
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && err.code === MONGO_ENTITY_EXISTS_ERROR_CODE) {
      throw new ENTITY_EXISTS(`Такой ${ENTITY_NAME} уже существует`);
    } else {
      throw err;
    }
  }
};

export { save };