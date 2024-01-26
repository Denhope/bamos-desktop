export interface IProjectTask {
  _id: string;
  taskId?: string;
  taskNumber?: string;
  taskDescription?: string;
  area?: string;
  access?: string[];
  code?: string;
  workerNumber?: number;
  allTaskTime?: number;
  specialization?: string;
  planeId?: any;
  projectId?: string;
  createrUserId?: string;
  createUserName?: CreateUserName;
  projectTaskWO?: number;
  WOCustomer?: string;
  WOPackageType?: string;
  taskType?: string;
  isDoubleInspectionRequired?: boolean;
  workStepReferencesLinks?: WorkStepReferencesLink[];
  actions?: IActionType[];
  finalAction: IFinalAction | null;
  createDate: string | null;
  startDate?: string | null;
  finishDate?: Date;
  optional?: Optional;
  ammtossArrNew?: any;
  amtossNewRev?: any;
  amtoss?: string;
  zonesArr: any;
  status: string;
  plane: IPlaneType;
  cascader?: string[];
  rewiewStatus?: string;
  tags?: string[];
  note?: string;
  companyID: string;
  projectWO: number;
  ata?: string;
  zone?: string;
  requirementItemsIds?: any[];
  removeInslallItemsIds?: any[];
  QRCodeLink?: any;

  position?: string;

  ТResources?: any[];
  nrcType?: string;
  skill: any[];
}
export type TStatus =
  | 'open'
  | 'inProgress'
  | 'closed'
  | 'completed'
  | 'canceled'
  | 'отложен'
  | 'в работе'
  | 'выполнен'
  | 'закрыт';
export interface CreateUserName {
  name?: string;
  singNumber?: string;
  engishName?: string;
}

export interface WorkStepReferencesLink {
  type?: string;
  reference?: string;
  description?: string;
}
export type IPlaneType = {
  registrationNumber?: string;
  fuctoryNumber?: string;
  type: string;
  companyID?: string;
  companyName?: string;
};
export interface IActionType {
  actionDescription?: string;
  performedSing?: string | null;
  performedDate?: string | null;
  performedTime?: any;
  performedName?: string | null;
  inspectedDate?: string | null;
  inspectedTime?: string;
  inspectedSing?: string | null;
  inspectedName?: string;
  actionNumber?: any;
  doubleInspectionSing?: string | null;
  doubleInspectedDate?: string | null;
  doubleInspectedTime?: string;
  doubleInspectedName?: string | null;
  cteateDate?: any | null;
  actionCteateUserID?: any | null;
  updateDate?: any | null;
  actionUpdateUserID?: string | null;
}

export interface IFinalAction {
  closingSing?: string | null;
  closingDate?: string | null;
  closingTime?: string;
  closingName?: string;
  timeUsed?: string | null | number;
  timeUsedUserID?: string | null | number;
  DIClosingSing?: string | null;
  DIClosingDate?: string | null;
  dIClosingTime?: string | null;
  DIClosingName?: string | null;
  updateDate?: any | null;
  actionUpdateUserID?: string | null;
}

export interface Optional {
  isClose?: boolean;
  isDone?: boolean;
  isActive?: boolean;
}
