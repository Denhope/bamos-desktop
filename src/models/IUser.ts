export interface IUser {
  name: string;
  email: string;
  password: string;
  _id?: string;
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
