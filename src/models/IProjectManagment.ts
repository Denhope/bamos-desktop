import { IAplicationInfo } from "@/types/TypesData";
import { IUser } from "./IUser";

export interface IProjectModel {
  id?: string;
  projectType?: TProjectType;
  projectId?: string;
  projectName: string;
  aplicationId?: IAplicationInfo;
  planedStartDate?: any;
  planedFinishDate?: any;
  startDate?: any;
  finishDate?: any;
  status: TProjectState;
  projectWO?: number;
  description?: string;
  ownerId: IUser;
  createDate?: Date;
  createBySing?: string;
  createByID?: string;
  isEdited?: boolean;
  customer?: boolean;
  acRegistrationNumber?: any;
  manufactureNumber?: any;
  acType?: any;
  acHours?: any;
  acLDG?: any;
  WOType?: any;
  classification?: any;
  department?: any;
  optional?: any;
  updateDate?: Date;
  updateUserID?: string;
  updateUserSing?: string;
}

export type TProjectState =
  | "COMPLETED"
  | "OPEN"
  | "CLOSED"
  | "CANCELLED"
  | "DRAFT";
export type TProjectType =
  | "MAINTENANCE_AC_PROJECT"
  | "REPAIR_AC_PROJECT"
  | "REPAIR_COMPONENT_PROJECT"
  | "SERVICE_COMPONENT_PROJECT"
  | "COMPONENT_REPAIR_PROJECT"
  | "PRODUCTION_PROJECT"
  | "PURCHASE_PROJECT"
  | "MINIMUM_SUPPLY_LIST";
