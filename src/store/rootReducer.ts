import { combineReducers } from '@reduxjs/toolkit';
import { reportsApi } from '@/features/reports/reportsApi';
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
import formReducer from './reducers/formSlice'; //
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
import userGroupReducer from '@/features/userAdministration/userGroupSlice';
// import acAdministrationReducer from '../../src/features/ACAdministration/acAdminSlice';
// import { acApi } from '@/features/ACAdministration/acApi';
import acAdministrationReducer from '../../src/features/acAdministration/acAdminSlice';
import menuItemsReducer from './reducers/menuItemsReducer';
import cardPositionReducer from './reducers/cardPositionReducer';
import tabsReducer from './reducers/TabsSlice'; //

import { ordersNewApi } from '@/features/orderNewAdministration/ordersNewApi';
import { orderItemApi } from '@/features/orderItemsAdministration/orderItemApi';
import { projectTypeApi } from '@/components/projectTypeAdministration/projectTypeApi';
import { projectItemApi } from '@/features/projectItemAdministration/projectItemApi';
import { projectItemWOApi } from '@/features/projectItemWO/projectItemWOApi';
import { storesTaskApi } from '@/features/storeAdministration/StoreApi';
import { locationsTypeApi } from '@/features/storeAdministration/LocationTypeApi';
import { locationsApi } from '@/features/storeAdministration/LocationApi';
import { storePartsApi } from '@/features/storeAdministration/PartsApi';
import { bookingApi } from '@/features/bookings/bookingApi';
import { reportApi } from '@/features/reportAdministration/ReportApi';
import { toolTypeApi } from '@/features/storeAdministration/ToolTypeApi';
import { projectStepApi } from '@/features/projectItemWO/stepApi';
import { skillApi } from '@/features/userAdministration/skillApi';
import { taskStepApi } from '@/features/tasksAdministration/stepApi';
import { partTaskNumberApi } from '@/features/tasksAdministration/partApi';
import { accessCodeApi } from '@/features/accessAdministration/accessApi';
import { altPartNumberApi } from '@/features/partAdministration/altPartApi';
import { pickSlipApi } from '@/features/pickSlipAdministration/pickSlipApi';
import { pickSlipItemsApi } from '@/features/pickSlipAdministration/pickSlipItemsApi';
import { pickSlipBookingsItemsApi } from '@/features/pickSlipAdministration/pickSlipBookingsItemsApi';
import { restrictionApi } from '@/features/restrictionAdministration/restrictionApi';
import { wpApi } from '@/features/wpAdministration/wpApi';
import columnWidthsReducer from './reducers/columnWidthsSlice'; // Добавьте эту строку
import columnWidthsExpiryReducer from './reducers/columnWidthsExpirySlice';
import columnWidthsReqReducer from './reducers/columnWidthrReqlice'; //
import columnReducer from './reducers/columnSlice'; //
import coketReducer from './reducers/WebSocketSlice'; //

import { certificatesTypeApi } from '@/features/requirementsTypeAdministration/certificatesTypeApi';
import { orderTextTypeApi } from '@/features/orderTextTypeAdministration/orderTextTypeApi';
import { actionsTemplatesApi } from '@/features/templatesAdministration/actionsTemplatesApi';
// import { acApi } from '@/features/ACAdministration/acApi';
import { acApi } from '@/features/acAdministration/acApi';
import { stockApi } from '@/features/stockAdministration/stockApi';
import { supportRequestApi } from './slices/supportRequestApi';
import { fileUploadApi } from '@/features/restrictionAdministration/fileUploadApi';
import { actionApi } from '@/features/projectItemWO/actionsApi';

const rootReducer = combineReducers({
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
  socket: coketReducer,
  [accessCodeApi.reducerPath]: accessCodeApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [projectItemApi.reducerPath]: projectItemApi.reducer,
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
  [projectItemWOApi.reducerPath]: projectItemWOApi.reducer,
  [storesTaskApi.reducerPath]: storesTaskApi.reducer,
  [locationsTypeApi.reducerPath]: locationsTypeApi.reducer,
  [locationsApi.reducerPath]: locationsApi.reducer,
  [storePartsApi.reducerPath]: storePartsApi.reducer,
  [bookingApi.reducerPath]: bookingApi.reducer,
  [reportApi.reducerPath]: reportApi.reducer,
  [toolTypeApi.reducerPath]: toolTypeApi.reducer,
  [projectStepApi.reducerPath]: projectStepApi.reducer,
  [skillApi.reducerPath]: skillApi.reducer,
  [taskStepApi.reducerPath]: taskStepApi.reducer,
  [partTaskNumberApi.reducerPath]: partTaskNumberApi.reducer,
  [altPartNumberApi.reducerPath]: altPartNumberApi.reducer,
  [pickSlipApi.reducerPath]: pickSlipApi.reducer,
  [pickSlipItemsApi.reducerPath]: pickSlipItemsApi.reducer,
  [pickSlipBookingsItemsApi.reducerPath]: pickSlipBookingsItemsApi.reducer,
  [restrictionApi.reducerPath]: restrictionApi.reducer,
  [wpApi.reducerPath]: wpApi.reducer,
  [certificatesTypeApi.reducerPath]: certificatesTypeApi.reducer,
  [orderTextTypeApi.reducerPath]: orderTextTypeApi.reducer,
  [actionsTemplatesApi.reducerPath]: actionsTemplatesApi.reducer,
  [stockApi.reducerPath]: stockApi.reducer,
  [supportRequestApi.reducerPath]: supportRequestApi.reducer,
  [fileUploadApi.reducerPath]: fileUploadApi.reducer,
  [reportsApi.reducerPath]: reportsApi.reducer,
  [actionApi.reducerPath]: actionApi.reducer,

  // [actionsTemplatesApi.reducerPath]: actionsTemplatesApi.reducer,

  vendor: vendorReducer,
  acTypes: acTypesReducer,
  ACZones: zonesReducer,
  tasksAdministration: taskReducer,
  planesAdministration: acAdministrationReducer,
  columnWidths: columnWidthsReducer, // Добавьте эту строку
  columnWidthsExpiry: columnWidthsExpiryReducer,
  columnWidthrReq: columnWidthsReqReducer,
  form: formReducer,
  columns: columnReducer,
  tabs: tabsReducer,
  menuItems: menuItemsReducer,
  cardPosition: cardPositionReducer,

});

export default rootReducer;