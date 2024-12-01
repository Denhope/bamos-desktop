import { TStatus } from './IProject';
import { ITask } from './ITask';
import { IPartNumber } from './IUser';

export interface IACType {
  _id: any | null | undefined;
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
  prefix(prefix: any): unknown;
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
export interface IProjectType {
  acTypeID?: any;
  skillCodeID?: any;
  projectName: any;
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

export interface IProjectItem {
  reference?: any[];
  taskNumberID: any;
  woType: any;
  reqCode: any;
  taskNumber?: any;
  taskDescription?: any;
  DESCRIPTION: any;
  id: string;
  qty: number;
  partNumberID: any;
  notes?: string;
  description: string;
  companyID: string;
  createDate: Date;
  createUserID: string;
  updateDate?: Date;
  updateUserID?: string;
  files?: any[];
  vendorID?: string;
  woItemsId?: any[];
  projectItemsWOID?: any[];
  planeID?: string;
}
export interface IProjectItemWO {
  isCriticalTask?: any;
  taskNumber: string;
  taskDescription: string;
  title: any;
  taskWO: any;
  closedByID: any;
  status: string;
  projectTaskWO?: any;
  taskWo?: any;
  projectItemID?: any;
  projectID?: string | any;
  restrictionID?: any;
  id: string;
  skillCodeID?: any;
  stepID?: any;
  _id?: string;
  qty: number;
  partNumberID: any;
  notes?: string;
  description: string;
  companyID: string;
  createDate?: any;
  createUserID?: any;
  updateDate?: any;
  updateUserID?: any;
  startDate?: Date;
  finishDate?: Date;
  planedStartDate?: Date;
  planedFinishDate?: Date;
  files?: any[];
  vendorID?: string;
  taskId?: any;
  projectTaskReferenceID?: string;
  projectTaskID?: string;
  preparationID?: any;
  projectItemType?: any;
  projectItemReferenceID?: any;
  partTaskID?: any;
}

export interface IProject {
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
  ACID?: string[] | IACType[];
  planedStartDate?: any;
  planedFinishDate?: any;
  startDate?: any;
  finishDate?: any;
  status?: TStatus;
  projectWO?: number;
  projectName: string;
  WPID?: string[];
}
