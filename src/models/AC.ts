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

export interface IRequirementType {
  id: string;
  code: string;
  title: string;
  notes?: string;
  description: string;
  companyID: string;
  createDate: Date;
  createUserID: string;
  updateDate?: Date;
  updateUserID?: string;
  files?: any[];
  maintenanceTypes?: IMaintenanceType[];
}
export interface IRequirementCode {
  id: string;
  code: string;
  notes?: string;
  title: string;
  description: string;
  companyID: string;
  createDate: Date;
  createUserID: string;
  updateDate?: Date;
  updateUserID?: string;
  reqTypesID: string;
  files?: any[];
  maintenanceTypes?: IMaintenanceType[];
}
