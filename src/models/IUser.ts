import { Permission } from '@/components/auth/PermissionGuard';
import { IRequirement, Requirement } from './IRequirement';
import { ITask } from './ITask';

export interface IUser {
  name: string;
  email: string;
  password: string;
  _id?: string;
  id: string;
  firstName?: string;
  lastName?: string;
  singNumber?: string;
  role?: string;
  companyID: string;
  telegramID: string;
  nameEnglish: string;
  pass: string;
}
export interface ISkill {
  id: string;
  code: string;
  description: string;
  companyID: string;
  createDate: string;
  createByID: string;
  updateDate?: string;
  updateByID?: string;
}
export type UserResponce = {
  name: string;
  email: string;
  _id: string;
  firstName?: string;
  lastName?: string;
  singNumber?: string;
  role: string;
  companyID: string;
  telegramID: string;
  nameEnglish: string;
  pass: string;
};

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
export enum AccountRole {
  ADMIN = 'admin',
  TECHNICAN = 'technican',
  LOGISTIC = 'logistic',
  STOREMAN = 'storeMan',
  GUEST = 'guest',
}

export interface User {
  organizationAuthorization?: any;
  lastNameEnglish?: any;
  firstNameEnglish?: any;
  photoUrl?: any;
  _id?: string;
  id: string;
  firstName: string;

  name?: string;
  login?: any;
  lastName: string;
  englishFirstName: string;
  englishLastName: string;
  email: string;
  phoneNumber: string;
  telegramId: string;
  role: AccountRole;
  workshopNumber: string;
  permissions?: Permission[];
  companyID: string;
  telegramID: string;
  password: string;
  pass: string;
  userGroupID: any;
  userSkillID?: any;
  userGroupname?: string;
  singNumber?: string;
  accountStatus: AccountStatus;
  skillID?: any;
}

export interface UserGroup {
  id: string;
  title: string;
  description: string;
  createDate: string;
  createUserID: string;
  updateDate?: string;
  updateUserID?: string;
  companyID?: string;
  users?: User[];
  permissions?: any;
}

export interface ICompany {
  id: string;
  title: string;
  description: string;
  companyName: string;
  code?: string;
  email: string;
  emailBamosSupport: string;
  emailBamosSupportPass: string;
  contacts: string;
  createDate: string;
  createByID: string;
  updateDate?: string;
  updateByID?: string;
  FILES?: any[];
}

export interface IVendor {
  id: string;
  CODE: string;
  SHORT_NAME: string;
  NAME: string;
  UNP: string;
  ADRESS: string;
  MAIN_ACCOUNT: string;
  BANK: string;
  IS_RESIDENT: boolean;
  COUNTRY: string;
  MAIN_CONTRACT: any;
  EMAIL: string;
  companyID: string;
  createDate: Date;
  createUserID: string;
  updateDate?: Date;
  updateUserID?: string;
}

export interface IPartNumber {
  isShelfLifeExpired?: boolean;
  isRepair?: boolean;
  isOverhaul?: boolean;
  isBenchCheck?: boolean;
  isCalibration?: boolean;
  TOOL_TYPE_CODE?: string;
  LOCATION?: string;
  locationName?: any;
  NAME_OF_MATERIAL?: any;
  REMARKS?: any;
  QUANTITY?: any;
  quantity?: number;
  id?: any;
  status: string;
  _id: string;
  PART_NUMBER: string;
  DESCRIPTION: string;
  TYPE: string;
  GROUP: string;
  UNIT_OF_MEASURE: string;
  UNIT_OF_MEASURE_LONG: string;
  ADD_DESCRIPTION: string;
  ADD_UNIT_OF_MEASURE: boolean;
  STATUS?: string;
  MANAFACTURER?: string;
  DEFAULT_REPAIRE?: string;
  DEFAULT_SUPPLIER?: string;
  PART_PICKSLIP_REMARKS?: string;
  PART_RECEIVING_REMARKS?: string;
  PART_REPARE_REMARKS?: string;
  PART_PURCHASE_REMARKS?: string;
  COUNTRY_OF_ORIGIN?: string;
  RESOURCE_TYPE?: string;
  companyID: string;
  createDate: any;
  createUserID: string | any;
  updateDate?: any;
  updateUserID?: string | any;
  acTypeID?: string | any;
}
export interface IAltPartNumber {
  ISTWOWAY: any;
  ISTWOWAYS: any;
  altPartNumberID: any;
  ALTERNATIVE: any;
  id?: any;
  status: string;
  _id: string;
  partNumberId?: string | Object;
  altPartNumberId?: string | Object;
  companyID: string;
  createDate: any;
  createUserID: string | Object;
  updateDate?: any;
  updateUserID?: string | Object;
  acTypeID?: string | any;
}

export interface IProjectTask {
  projectTaskWO: any;
  taskWo: any;
  id?: string;
  taskWO: number;
  taskType?: NRCType | ScheduledType;
  taskId?: string | ITask;
  projectId?: string;
  startDate?: Date;
  finishDate?: Date;
  planedStartDate?: Date;
  planedFinishDate?: Date;
  companyID: string | ICompany;
  createDate: Date;
  createUserID: string;
  updateDate?: Date;
  updateUserID?: string;
  // materialReuestAplications?: MatRequestAplication[];
  // workNeed?: IWorkNeed;
  isDoubleInspectionRequired?: boolean;
  status: TStatus;
  WOType?: NRCType | ScheduledType;
  workPackageID?: string | any;
  requirementsIds?: IRequirement[];
  taskCassificationID?: string;
}
export type NRCType = 'PIREP' | 'CABIN' | 'MAINT';
export type ScheduledType =
  | 'routine'
  | 'hardTime'
  | 'additional'
  | 'partRepare'
  | 'addHock'
  | 'sheduled'
  | '';

export type TStatus =
  | 'open'
  | 'inProgress'
  | 'closed'
  | 'completed'
  | 'canceled'
  | 'planed';

export interface IStore {
  _id: string;
  id?: string;
  description: string;
  storeShortName: string;
  storeLongName: string;
  stationID?: string;
  ownerID: string | ICompany;
  companyID: string | ICompany;
  createDate: any;
  createUserID: any;
  updateDate?: any;
  updateUserID?: any;
  adress: string;
  country: string;
  remarks?: string;
  status: any;
  restrictionID?: any;
  storemanID?: any;
  files?: any[];
}

export interface ILocation {
  id?: string;
  description: string;
  locationName: string;
  stationID?: string;
  ownerID: string | any;
  companyID: string | ICompany;
  createDate: any;
  createUserID: any;
  updateDate?: any;
  updateUserID?: any;
  adress: string;
  country: string;
  remarks?: string;
  status: any;
  restriction: 'standart' | 'inaccessible' | 'restricted';
  locationTypeID?: any;
  storeID?: any;
  storageTypeID?: any;
  files?: any[];
}

export interface ILocationType {
  id?: string;
  description: string;
  code: string;
  companyID: string | ICompany;
  createDate: any;
  createUserID: any;
  updateDate?: any;
  updateUserID?: any;
  remarks?: string;
  status?: any;
  storeID?: any;
  files?: any[];
}

export interface IRestriction {
  id?: string;
  description: string;
  code: string;
  companyID: string | ICompany;
  createDate: any;
  createUserID: any;
  updateDate?: any;
  updateUserID?: any;
  remarks?: string;
  status?: any;
  files?: any[];
}

export interface IStorePartItem {
  UNIT_LIMIT: IStorePartItem[] | undefined;
  CONDITION: string;
  intervalMOS: IStorePartItem[] | undefined;
  estimatedDueDate: IStorePartItem[] | undefined;
  _id: string | undefined;
  nextDueMOS: IStorePartItem[] | undefined;
  FILES: IStorePartItem[] | undefined;
  RECEIVING_NUMBER: string;
  QUANTITY: string;
  LOCAL_ID: IStorePartItem[];
  OWNER_SHORT_NAME: IStorePartItem[];
  PRODUCT_EXPIRATION_DATE: any;
  SERIAL_NUMBER: string;
  SUPPLIER_BATCH_NUMBER: string;
  storeID: any;
  GROUP: IStorePartItem[];
  id?: string;
  locationID?: any;
  NAME_OF_MATERIAL: string;
  UNIT_OF_MEASURE: string;
  PART_NUMBER: string;
  RACK_NUMBER: string;
  SHELF_NUMBER: string;
  ownerID: string | ICompany;
  companyID: string | ICompany;
  createDate: any;
  createUserID: any;
  updateDate?: any;
  updateUserID?: any;

  remarks?: string;
  status: any;

  files?: any[];
}
