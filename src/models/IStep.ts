import { User } from './IUser';

export interface IStep {
  defectCodeID?: any;
  projectTaskID?: string;
  stepType: any;
  projectId?: any;
  projectID?: any;
  projectItemID?: any;

  id?: string;
  stepNumber: number;
  createUserID?: any;
  createDate?: Date;
  stepHeadLine: string;
  stepDescription: string;
  actions?: Action[];
  companyID?: string;
  userDurations?: any[];
  stepIdentificator?: number;
  taskId?: string;
  skillID?: string[];
  userGroupID?: string[];
  taskStatus?: any;
  stepIndex?: number;
}

type ActionType = 'pfmd' | 'inspect' | 'doubleInspect' | 'closed';

export interface Action {
  projectTaskID: any;
  isComponentChangeAction?: boolean;
  projectStepId?: any;
  id?: string | null;
  _id?: string;
  type: ActionType;
  headline: string;
  description: string;
  createDate?: any;
  createUserID?: any;
  updateDate?: string;
  updateById?: string;
  projectId?: string;
  companyID?: string;
  projectItemID?: any;
  userDurations: any[] | [];
  taskID?: string;
}
