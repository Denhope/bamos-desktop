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
import { acTypeApi } from '@/features/acTypeAdministration/acTypeApi';
import { taskCodeApi } from '@/features/tasksAdministration/taskCodesApi';
import { zoneCodeApi } from '@/features/zoneAdministration/zonesApi';
import { mpdCodeApi } from '@/features/MPDAdministration/mpdCodesApi';
import { taskApi } from '@/features/tasksAdministration/tasksApi';
import { partNumberApi } from '@/features/partAdministration/partApi';
import { projectsTaskApi } from '@/features/projectTaskAdministration/projectsTaskApi';
import { requirementsTypeApi } from '@/features/requirementsTypeAdministration/requirementsTypeApi';
import { requirementsCodesApi } from '@/features/requirementsCodeAdministration/requirementsCodesApi';
import { projectsApi } from '@/features/projectAdministration/projectsApi';

import { requirementApi } from '@/features/requirementAdministration/requirementApi';
import vendorReducer from '../../src/features/vendorAdministration/vendorSlice';
import acTypesReducer from '../../src/features/acTypeAdministration/acTypesSlice';
import zonesReducer from '../../src/features/zoneAdministration/zonesSlice';
import taskReducer from '../../src/features/tasksAdministration/taskSlice';
// import  vendorReducer  from '@/features/vendorAdministration/vendorSlice';
import userGroupReducer from '@/features/userAdministration/userGroupSlice';
import acAdministrationReducer from '../../src/features/ACAdministration/acAdminSlice';
import { acApi } from '@/features/ACAdministration/acApi';
import { ordersNewApi } from '@/features/orderNewAdministration/ordersNewApi';
import { orderItemApi } from '@/features/orderItemsAdministration/orderItemApi';
import { projectTypeApi } from '@/components/projectTypeAdministration/projectTypeApi';

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
    [acTypeApi.reducerPath]: acTypeApi.reducer,
    [taskCodeApi.reducerPath]: taskCodeApi.reducer,
    [zoneCodeApi.reducerPath]: zoneCodeApi.reducer,
    [requirementApi.reducerPath]: requirementApi.reducer,
    [mpdCodeApi.reducerPath]: mpdCodeApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,
    [acApi.reducerPath]: acApi.reducer,
    [requirementsTypeApi.reducerPath]: requirementsTypeApi.reducer,
    [requirementsCodesApi.reducerPath]: requirementsCodesApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [partNumberApi.reducerPath]: partNumberApi.reducer,
    [projectsTaskApi.reducerPath]: projectsTaskApi.reducer,
    [ordersNewApi.reducerPath]: ordersNewApi.reducer,
    [orderItemApi.reducerPath]: orderItemApi.reducer,
    [projectTypeApi.reducerPath]: projectTypeApi.reducer,

    vendor: vendorReducer,
    acTypes: acTypesReducer,
    ACZones: zonesReducer,
    tasksAdministration: taskReducer,
    planesAdministration: acAdministrationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
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
      projectTypeApi.middleware
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
