import { IAplicationInfo } from '@/types/TypesData';
import { IUser } from './IUser';

export type TStatus =
  | 'В работе'
  | 'завершен'
  | 'отложен'
  | 'open'
  | 'draft'
  | 'completed'
  | 'inProgress'
  | 'close'
  | 'canceled';
export interface IProjectInfo {
  id?: string;
  projectId?: string;
  projectName: string;
  aplicationId: IAplicationInfo;
  planedStartDate?: any;
  planedFinishDate?: any;
  startDate?: any;
  finishDate?: any;
  status?: TStatus;
  projectWO?: number;
  description?: string;
  optional?: {
    isRoutineTaskCreated?: boolean;
    isAdditionalTaskCreated?: boolean;
    isHardTimeTasksCreated?: boolean;
    isStarting?: boolean;
    isFavorite?: boolean;
    isDone?: boolean;
    isActive?: boolean;
    description?: string;
  };
  ownerId: IUser;
  createDate?: Date;

  isEdited?: boolean;
}

export interface IProjectResponce {
  _id: string;
  companyID: string;
  aplicationId?: string;
  ownerId: string;
  projectWO: number;
  projectName: string;
  planeType?: string;
  planeNumber: string;
  aplicationName: string;
  companyName: string;
  WOType: string;
  status: TStatus;
  createDate: string;
  startDate: any;
  finishDate: any;
  description?: string;
  planeStatus?: any[];
}

export interface IProject {
  WONumber?: any;
  WPNumber?: any;
  WOName?: any;
  projectType?: string;
  _id: any;
  id: string;
  projectName: string;
  aplicationId?: string | IAplicationInfo;
  planedStartDate?: Date;
  planedFinishDate?: Date;
  startDate?: Date;
  finishDate?: Date;
  status?: TStatus;
  projectWO?: number | string;
  description?: string;
  createDate: string;
  createUserID: string | any;
  updateDate?: string;
  updateUserID?: string | any;
  FILES?: any[];
  workPackageIds?: any[];
  isEditing?: boolean;
  planeId?: string | any;
  acTypeID?: string | any;
  customerID?: string;
}
