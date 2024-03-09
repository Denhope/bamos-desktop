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

export enum Permission {
  CREATE_USER = 'CREATE_USER',
  DELETE_USER = 'DELETE_USER',
  EDIT_USER = 'EDIT_USER',
  ADD_WO = 'ADD_WO',
  EDIT_WO = 'EDIT_WO',
  // Добавьте другие разрешения, если нужно
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
export enum AccountRole {
  ADMIN = 'admin',
  TECHNICAN = 'technican',
  LOGISTIC = 'logistic',
  STOREMAN = 'storeMaan',
  GUEST = 'guest',
}

export interface User {
  _id?: string;
  id: string;
  firstName: string;
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
  userGroupname?: string;
  singNumber?: string;
  accountStatus: AccountStatus;
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
}

export interface ICompany {
  id: string;
  title: string;
  description: string;
  companyName: string;
  code?: string;
  email: string;
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
