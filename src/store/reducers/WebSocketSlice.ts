import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/utils/api/http';

interface Subscription {
  _id: string;
  userId: string;
  eventType: string;
}

interface SocketState {
  emit: any;
  connected: any;
  socket: Socket | null;
  isConnected: boolean;
  subscriptions: Subscription[];
  retryCount: number;
  maxRetryCount: number;
}

const initialState: SocketState = {
    socket: null,
    isConnected: false,
    subscriptions: [],
    retryCount: 0,
    maxRetryCount: 5,
    emit: undefined,
    connected: undefined
};

export const connectSocket = createAsyncThunk<Socket, string>(
  'socket/connect',
  async (userId, { dispatch, getState }) => {
    const token = localStorage.getItem('token');
    const socket = io(API_URL, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    return new Promise((resolve, reject) => {
      socket.on('connect', () => {
        console.log('Сокет подключен');
        dispatch(setConnected(true));
        dispatch(resetRetryCount());
        socket.emit('userConnected', userId);
        resolve(socket);
      });

      socket.on('connect_error', (error) => {
        console.error('Ошибка подключения сокета:', error);
        reject(error);
      });

      // ... остальные обработчики событий ...
    });
  }
);

export const subscribeToEventType = createAsyncThunk<void, { userId: string; eventType: string }>(
  'socket/subscribe',
  async ({ userId, eventType }, { dispatch, getState }) => {
    const state = getState() as { socket: SocketState };
    if (state.socket?.connected) {
      state.socket.emit('subscribe', userId, eventType);
    }
  }
);

export const unsubscribeFromEventType = createAsyncThunk<void, { userId: string; eventType: string }>(
  'socket/unsubscribe',
  async ({ userId, eventType }, { dispatch, getState }) => {
    const state = getState() as { socket: SocketState };
    if (state.socket?.connected) {
      state.socket.emit('unsubscribe', userId, eventType);
    }
  }
);

export const disconnectSocket = createAsyncThunk(
  'socket/disconnect',
  async (_, { getState }) => {
    const state = getState() as { socket: SocketState };
    if (state.socket.socket) {
      state.socket.socket.disconnect();
      
    }
  }
);

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    addSubscription(state, action) {
      state.subscriptions.push(action.payload);
    },
    removeSubscription(state, action) {
      state.subscriptions = state.subscriptions.filter(sub => sub.eventType !== action.payload);
    },
    setConnected(state, action) {
      state.isConnected = action.payload;
    },
    incrementRetryCount(state) {
      state.retryCount += 1;
    },
    resetRetryCount(state) {
      state.retryCount = 0;
    },
    disconnectSocket: (state) => {
      if (state.socket) {
        state.socket.disconnect();
      }
      state.socket = null;
      state.isConnected = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectSocket.fulfilled, (state, action) => {
        state.socket = action.payload as Socket;
        state.isConnected = true;
      })
      .addCase(connectSocket.rejected, (state) => {
        state.isConnected = false;
      })
      .addCase(subscribeToEventType.fulfilled, (state, action) => {
        const { userId, eventType } = action.meta.arg;
        state.subscriptions.push({ _id: '', userId, eventType });
      })
      .addCase(unsubscribeFromEventType.fulfilled, (state, action) => {
        const { eventType } = action.meta.arg;
        state.subscriptions = state.subscriptions.filter(sub => sub.eventType !== eventType);
      })
      .addCase(disconnectSocket.fulfilled, (state) => {
        state.socket = null;
        state.isConnected = false;
      });
  },
});

export const { addSubscription, removeSubscription, setConnected, incrementRetryCount, resetRetryCount } = socketSlice.actions;
export default socketSlice.reducer;