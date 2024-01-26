import { CheckboxValueType } from "antd/es/checkbox/Group";

import { MatRequestAplication } from "@/store/reducers/ProjectTaskSlise";
import { IMatDataAdditional, ITaskType } from "@/types/TypesData";

export type TDifficulty =
  | "routine"
  | "hardTime"
  | "additional"
  | "PIREP"
  | "CABIN"
  | "MAINT"
  | "partRepare"
  | "";

export type TStatus =
  | "отложен"
  | "в работе"
  | "выполнен"
  | "закрыт"
  | "open"
  | "closed"
  | "canceled"
  | "inProgress";

export interface IMatPrintItem {
  PART_NUMBER?: string;
  NAME_OF_MATERIAL?: string;
  QUANTITY: number;
  UNIT_OF_MEASURE?: string;
  _id?: string;
  id?: string;
}
export interface IResourcesRequests {}
export type IPlaneType = {
  registrationNumber?: string;
  fuctoryNumber?: string;
  type: string;
  companyID?: string;
  companyName?: string;
};
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
export type INRCInfoType = {
  ata?: string;
  zone?: string;
  area?: string;
  position?: string;
  access?: string;
  ТResources?: any[];
  nrcType: string;
  skill: string[];
};
export type IReferencesLinkType = {
  type: "WO" | "AMM" | "SB" | "" | "NRC";
  reference: string;
  description: string;
};
export interface IStep {
  id: string | null;
  stepDescription?: string | null;
  stepHeadLine?: string | null;
  createDate?: any;
  actions: any[];
  createById: string | null;
}
export interface IAdditionalTaskMTBCreate {
  companyID?: string;
  createUserName?: any;
  ata?: string;
  position?: string;
  zone?: string;
  zoneNbr?: any;
  editMode?: boolean;
  _id?: string;
  id?: string;
  taskType?: NRCType | ScheduledType;
  resourcesRequests?: any[];
  taskHeadLine?: string;
  taskDescription?: string;
  isDoubleInspectionRequired?: boolean;
  workStepReferencesLinks?: IReferencesLinkType[];
  taskId?: string | ITaskType;
  projectId?: any;
  projectTaskID?: string;
  ownerId?: any;
  startDate?: string | null;
  finishDate?: string | null;
  planedStartDate?: string | null;
  planedFinishDate?: string | null;
  createDate?: string | null;
  closeDate?: string | null;
  material?: any;
  instrument?: [];
  actions: IActionType[] | null;
  steps: IStep[] | null;
  currentAction?: IActionType;
  currentActiveIndex?: any;
  tResources?: string[];
  nrcType?: any;
  skill?: string[];
  area?: string;
  cascader?: string[];
  rewiewStatus?: string;
  finalAction?: IFinalAction | null;
  optional?: {
    NRCInfo?: INRCInfoType;
    isHardAccessTask?: boolean;
    isStarting?: boolean;
    isFavorite?: boolean;
    isDone?: boolean;
    isActive?: boolean;
    workerId?: string;
    sing?: string;
    name?: string;
    isHaveNRC?: boolean;
    isClose?: boolean;
    finalAction?: IFinalAction;
  };
  status?: TStatus;
  location?: string;
  planeId?: string;
  plane?: IPlaneType;
  QRCodeLink?: string;
  additionalNumberId?: number;
  projectWO?: number;
  projectTaskWO?: number;
  materialAplications?: MatRequestAplication[];
  currentMaterialReuestAplication?: MatRequestAplication;
  taskPickSlipsMaterials?: any[];
  materialForPrint?: IMatPrintItem[];
  requirementItemsIds?: any[];
}
export type NRCType = "PIREP" | "CABIN" | "MAINT";
export type ScheduledType =
  | "routine"
  | "hardTime"
  | "additional"
  | "partRepare"
  | "";

export type IActionType = {
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
  isPartsRepareTask?: boolean;
  partsOffOnArr?: [];
  isTrasferTask?: boolean;
  transferTaskObj?: {};
};

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
