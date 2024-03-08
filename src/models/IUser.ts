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
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  // Добавьте другие разрешения, если нужно
}

export interface User {
  _id?: string;
  id: string;
  firstName: string;
  lastName: string;
  englishFirstName: string;
  englishLastName: string;
  email: string;
  phoneNumber: string;
  telegramId: string;
  role: string;
  workshopNumber: string;
  permissions?: Permission[];
  companyID: string;
  telegramID: string;
  password: string;
  pass: string;
}

export interface UserGroup {
  id: string;
  title: string;
  description: string;
  createDate: string;
  createByID: string;
  updateDate?: string;
  updateByID?: string;
  companyID?: string;
  users?: User[];
}
