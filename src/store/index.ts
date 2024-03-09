import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit';
import instrumentReducer from './reducers/InstrumentSlice';
import materialReducer from './reducers/MaterialSlice';
import applicationReducer from './reducers/AplicationSlice';
import authSlice from './reducers/AuthSlice';
import tasksReducer from './reducers/TasksSlice';
import projectsReducer from './reducers/ProjectSlise';
import projectTasksReducer from './reducers/ProjectTaskSlise';
import additionalTasksReducer from './reducers/AdditionalTaskSlice';
import filesUploadeReducer from './reducers/FilesSlise';
import materialAplicationReducer from './reducers/MatirialAplicationsSlise';
import pickSlipReducer from './reducers/PickSlipSlice';
import materialStoreReducer from './reducers/MaterialStoreSlice';
import viewsStoreReducer from './reducers/ViewsSlice';
import removedItemsStoreReducer from './reducers//RemovedItemsSlice';
import purchaseItemsStoreReducer from './reducers/PurchaseSlice';
import statisticsItemsStoreReducer from './reducers/StatisticsSlice';
import planesStoreReducer from './reducers/MtxSlice';
import mtbaseStoreReducer from './reducers/MtbSlice';
import planningStoreReducer from './reducers/WPGenerationSlise';
import storesLogisticReducer from './reducers/StoreLogisticSlice';
import userPreferencesSlice from './reducers/UserPreferencesSlice';
import { userApi } from '@/features/userAdministration/userApi';
import { userGroupApi } from '@/features/userAdministration/userGroupApi';
import { companyApi } from '@/features/companyAdministration/companyApi';
import { vendorApi } from '@/features/vendorAdministration/vendorApi';
import userGroupReducer from '@/features/userAdministration/userGroupSlice';
const store = configureStore({
  reducer: {
    auth: authSlice,
    files: filesUploadeReducer,
    tasks: tasksReducer,
    application: applicationReducer,
    instrument: instrumentReducer,
    material: materialReducer,
    projects: projectsReducer,
    projectTask: projectTasksReducer,
    additioonalTasks: additionalTasksReducer,
    materialAplication: materialAplicationReducer,
    pickSlips: pickSlipReducer,
    materialStore: materialStoreReducer,
    viewsStore: viewsStoreReducer,
    removedItems: removedItemsStoreReducer,
    purchaseItems: purchaseItemsStoreReducer,
    statisticsItems: statisticsItemsStoreReducer,
    planes: planesStoreReducer,
    mtbase: mtbaseStoreReducer,
    planning: planningStoreReducer,
    storesLogistic: storesLogisticReducer,
    userPreferences: userPreferencesSlice,
    userGroup: userGroupReducer,
    [userApi.reducerPath]: userApi.reducer,
    [userGroupApi.reducerPath]: userGroupApi.reducer,
    [companyApi.reducerPath]: companyApi.reducer,
    [vendorApi.reducerPath]: vendorApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      userGroupApi.middleware,
      companyApi.middleware,
      vendorApi.middleware
    ),
});
export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
