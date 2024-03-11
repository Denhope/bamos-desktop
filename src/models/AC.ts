export interface IACType {
  id: string;
  code: string;
  name: string;
  description: string;
  companyID: string;
  createDate: Date;
  createUserID: string;
  updateDate?: Date;
  updateUserID?: string;
  files?: any[];
  maintenanceTypes?: IMaintenanceType[];
}
export interface IMaintenanceType {
  id: string;
  code: string;
  name: string;
  description: string;
  companyID: string;
  createDate: Date;
  createUserID: string;
  updateDate?: Date;
  updateUserID?: string;
  files?: any[];
  manufacturer: string;
}
