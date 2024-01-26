import {
  IAreaDTO,
  IInspectionScopeDTO,
  IInstData,
  IInstData1,
  IMatData,
  IMatData1,
  IPanelDTO1,
  IPanelDTO2,
  ITaskType,
} from "@/types/TypesData";
import {
  IAdditionalTask,
  IFinalActionType,
  IMatPrintItem,
  IPlaneType,
  IReferencesLinkType,
} from "./IAdditionalTask";
import { IActionType } from "@/store/reducers/AdditionalTaskSlice";
import { MatRequestAplication } from "@/store/reducers/ProjectTaskSlise";
import { IProjectInfo } from "./IProject";

export type TDifficulty =
  | "routine"
  | "hardTime"
  | "additional"
  | "PIREP"
  | "CABIN"
  | "MAINT"
  | "partRepare"
  | "";

export type TStatus = "отложен" | "в работе" | "выполнен" | "закрыт";

export interface IWorkNeed {
  isElectricOnNeed?: boolean;
  isGidroNeed?: boolean;
  isElectricOffNeed?: boolean;
  isMechaisationOn?: boolean;
  engineOnNeed?: boolean;
  vsyOnNeed?: boolean;
  standUpNeed?: boolean;
}

export interface IProjectTask {
  _id?: string;
  id?: string;
  taskType?: NRCType | ScheduledType;
  workNeed?: IWorkNeed;
  taskId?: string | ITaskType;
  projectId?: string;
  ownerId?: string;
  startDate?: Date;
  finishDate?: Date;
  planedStartDate?: Date;
  planedFinishDate?: Date;
  createDate?: Date;
  material?: [];
  materialReuestAplications?: MatRequestAplication[];
  instrument?: [];
  isDoubleInspectionRequired?: boolean;
  optional?: {
    isHardAccessTask?: boolean;
    isStarting?: boolean;
    isFavorite?: boolean;
    isDone?: boolean;
    isActive?: boolean;
    workerId?: string;
    isHaveNRC?: boolean;
  };
  status: TStatus;
  WOType?: NRCType | ScheduledType;
  location?: string;
}
export type NRCType = "PIREP" | "CABIN" | "MAINT";
export type ScheduledType =
  | "routine"
  | "hardTime"
  | "additional"
  | "partRepare"
  | "addHock"
  | "sheduled"
  | "";

export interface IProjectTaskAll {
  _id: string | "";
  id?: string;
  taskType?: NRCType | ScheduledType;
  zone?: any;
  area?: any;
  zonesArr?: any;
  accessArr?: any;
  access?: any;
  subZone?: any;
  workNeed?: IWorkNeed;
  taskId?: ITaskType;
  projectId: string;
  ownerId?: string;
  startDate?: Date;
  finishDate?: Date;
  closeDate?: Date;
  planedStartDate?: Date;
  planedFinishDate?: Date;
  createDate?: Date;
  material?: IMatData[] | IMatData1[];
  newMaterial: IMatData1[];
  materialReuest: IMatData1[];
  materialReuestAplications: MatRequestAplication[];
  currentMaterialReuestAplication?: MatRequestAplication;
  instrument?: IInstData | IInstData1[];
  currentPanels?: IPanelDTO2[];
  currentNotIncludePanels?: IPanelDTO2[];
  currentZones?: IAreaDTO[];
  inspectionScope?: IInspectionScopeDTO[];
  actions: IActionType[];
  currentAction?: IActionType;
  currentActiveIndex?: any;
  rewiewStatus?: string;
  sing?: string;
  name?: string;
  isDoubleInspectionRequired?: boolean;
  taskPickSlipsMaterials?: any[];
  optional?: {
    // materialReuestAplications?: MatRequestAplication[];
    taskNumber?: string;
    taskDescription?: string;
    amtoss?: string;
    WOCustomer?: string;
    MJSSNumber?: number | string;
    WOPackageType?: string;
    position?: string;
    isHardAccessTask?: boolean;
    isStarting?: boolean;
    isFavorite?: boolean;
    isDone?: boolean;
    isActive?: boolean;
    workerId?: string;
    isHaveNRC?: boolean;
    sing?: string;
    name?: string;
    isClose?: boolean;
    finalAction?: IFinalActionType;
  };
  status: TStatus;
  WOType?: NRCType | ScheduledType;
  location?: string;
  projectTaskNRSs: IAdditionalTask[];
  workStepReferencesLinks?: IReferencesLinkType[];
  QRCodeLink?: string;
  projectTaskWO?: number;
  projectWO?: number;
  planeId?: string;
  plane?: IPlaneType;
  NRC?: IAdditionalTask[];
  materialForPrint?: IMatPrintItem[];
}
