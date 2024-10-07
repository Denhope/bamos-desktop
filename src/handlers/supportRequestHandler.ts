import { supportRequestService } from '../services/supportRequest.service';
import { Server } from 'socket.io';

export const handleSupportRequest = async (data: any, io: Server) => {
  switch (data.action) {
    case 'created':
      io.emit('supportRequestCreated', data.supportRequest);
      break;
    case 'updated':
      io.emit('supportRequestUpdated', data.supportRequest);
      break;
    case 'deleted':
      io.emit('supportRequestDeleted', data.id);
      break;
    default:
      console.log('Unknown action for support request');
  }
};