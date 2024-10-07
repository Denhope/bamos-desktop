import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import rootReducer from './rootReducer';
import { projectTypeApi } from '@/components/projectTypeAdministration/projectTypeApi';
// import { acApi } from '@/features/ACAdministration/acApi';
import { acApi } from '@/features/acAdministration/acApi';
import { mpdCodeApi } from '@/features/MPDAdministration/mpdCodesApi';
import { acTypeApi } from '@/features/acTypeAdministration/acTypeApi';
import { accessCodeApi } from '@/features/accessAdministration/accessApi';
import { bookingApi } from '@/features/bookings/bookingApi';
import { companyApi } from '@/features/companyAdministration/companyApi';
import { orderItemApi } from '@/features/orderItemsAdministration/orderItemApi';
import { ordersNewApi } from '@/features/orderNewAdministration/ordersNewApi';
import { altPartNumberApi } from '@/features/partAdministration/altPartApi';
import { partNumberApi } from '@/features/partAdministration/partApi';
import { pickSlipApi } from '@/features/pickSlipAdministration/pickSlipApi';
import { pickSlipBookingsItemsApi } from '@/features/pickSlipAdministration/pickSlipBookingsItemsApi';
import { pickSlipItemsApi } from '@/features/pickSlipAdministration/pickSlipItemsApi';
import { projectsApi } from '@/features/projectAdministration/projectsApi';
import { projectItemApi } from '@/features/projectItemAdministration/projectItemApi';
import { projectItemWOApi } from '@/features/projectItemWO/projectItemWOApi';
import { projectStepApi } from '@/features/projectItemWO/stepApi';
import { projectsTaskApi } from '@/features/projectTaskAdministration/projectsTaskApi';
import { reportApi } from '@/features/reportAdministration/ReportApi';
import { requirementApi } from '@/features/requirementAdministration/requirementApi';
import { requirementsCodesApi } from '@/features/requirementsCodeAdministration/requirementsCodesApi';
import { requirementsTypeApi } from '@/features/requirementsTypeAdministration/requirementsTypeApi';
import { restrictionApi } from '@/features/restrictionAdministration/restrictionApi';
import { locationsApi } from '@/features/storeAdministration/LocationApi';
import { locationsTypeApi } from '@/features/storeAdministration/LocationTypeApi';
import { storePartsApi } from '@/features/storeAdministration/PartsApi';
import { storesTaskApi } from '@/features/storeAdministration/StoreApi';
import { toolTypeApi } from '@/features/storeAdministration/ToolTypeApi';
import { partTaskNumberApi } from '@/features/tasksAdministration/partApi';
import { taskStepApi } from '@/features/tasksAdministration/stepApi';
import { taskCodeApi } from '@/features/tasksAdministration/taskCodesApi';
import { taskApi } from '@/features/tasksAdministration/tasksApi';
import { skillApi } from '@/features/userAdministration/skillApi';
import { userApi } from '@/features/userAdministration/userApi';
import { userGroupApi } from '@/features/userAdministration/userGroupApi';
import { vendorApi } from '@/features/vendorAdministration/vendorApi';
import { wpApi } from '@/features/wpAdministration/wpApi';
import { zoneCodeApi } from '@/features/zoneAdministration/zonesApi';
import { certificatesTypeApi } from '@/features/requirementsTypeAdministration/certificatesTypeApi';
import { orderTextTypeApi } from '@/features/orderTextTypeAdministration/orderTextTypeApi';
import { actionsTemplatesApi } from '@/features/templatesAdministration/actionsTemplatesApi';
import { stockApi } from '@/features/stockAdministration/stockApi';
import { supportRequestApi } from './slices/supportRequestApi';
import { fileUploadApi } from '@/features/restrictionAdministration/fileUploadApi';
import { reportsApi } from '@/features/reports/reportsApi';
import { actionApi } from '@/features/projectItemWO/actionsApi';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [
    'columnWidths',
    'columnWidthsExpiry',
    'columnWidthrReq',
    'form',
    'columns',
    'tabs',
    'menuItems',
    'cardPosition','columnState'
  ], // Добавьте эту строку, чтобы указать, какие части состояния нужно сохранять
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      userApi.middleware,
      userGroupApi.middleware,
      companyApi.middleware,
      vendorApi.middleware,
      acTypeApi.middleware,
      taskCodeApi.middleware,
      zoneCodeApi.middleware,
      requirementApi.middleware,
      mpdCodeApi.middleware,
      taskApi.middleware,
      acApi.middleware,
      requirementsTypeApi.middleware,
      requirementsCodesApi.middleware,
      projectsApi.middleware,
      partNumberApi.middleware,
      projectsTaskApi.middleware,
      ordersNewApi.middleware,
      orderItemApi.middleware,
      projectTypeApi.middleware,
      projectItemApi.middleware,
      projectItemWOApi.middleware,
      storesTaskApi.middleware,
      locationsTypeApi.middleware,
      locationsApi.middleware,
      storePartsApi.middleware,
      bookingApi.middleware,
      reportApi.middleware,
      toolTypeApi.middleware,
      projectStepApi.middleware,
      skillApi.middleware,
      taskStepApi.middleware,
      partTaskNumberApi.middleware,
      accessCodeApi.middleware,
      altPartNumberApi.middleware,
      pickSlipApi.middleware,
      pickSlipItemsApi.middleware,
      pickSlipBookingsItemsApi.middleware,
      restrictionApi.middleware,
      wpApi.middleware,
      certificatesTypeApi.middleware,
      orderTextTypeApi.middleware,
      actionsTemplatesApi.middleware,
      stockApi.middleware,
      supportRequestApi.middleware,
      fileUploadApi.middleware,
      reportsApi.middleware,
      actionApi.middleware
    ),
});

export const persistor = persistStore(store);

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
