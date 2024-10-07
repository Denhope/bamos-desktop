// Import the necessary functions and types
import { userApi } from '@/features/userAdministration/userApi';
import { configureStore } from '@reduxjs/toolkit';

// Create the store with the RTK Query middleware
export const store = configureStore({
  reducer: {
    // Add your other reducers here
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApi.middleware),
});

// Export the store's dispatch type
export type AppDispatch = typeof store.dispatch;
