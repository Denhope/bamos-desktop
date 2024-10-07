import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './rootReducer'
import { reportsApi } from '@/features/reports/reportsApi'

const store = configureStore({
  reducer: rootReducer,
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware().concat(reportsApi.middleware),
})

export default store