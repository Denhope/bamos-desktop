import { IActionType } from '@/store/reducers/AdditionalTaskSlice';
import { MatRequestAplication } from '@/store/reducers/ProjectTaskSlise';
import { IMatDataAdditional, ITaskType } from '@/types/TypesData';

export type TDifficulty =
  | 'routine'
  | 'hardTime'
  | 'additional'
  | 'PIREP'
  | 'CABIN'
  | 'MAINT'
  | 'partRepare'
  | '';

export type TStatus = 'отложен' | 'в работе' | 'выполнен' | 'закрыт';

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
export type IFinalActionType = {
  closingSing?: string;
  closingDate?: string;
  closingTime?: string;
  closingName?: string;
  DIClosingSing?: string;
  DIClosingDate?: string;
  DIClosingName?: string;
  DIClosingTime?: string;
  timeUsed?: string;
};
export type INRCInfoType = {
  ata?: string;
  zone?: string;
  area?: string;
  position?: string;
};
export type IReferencesLinkType = {
  type: 'WO' | 'AMM' | 'SB' | '' | 'NRC';
  reference: string;
  description: string;
};

export interface IAdditionalTask {
  companyID?: string;
  finalAction?: any;
  editMode?: boolean;
  _id?: string;
  id?: string;
  taskType?: NRCType | ScheduledType;
  resourcesRequests: any[];
  taskHeadLine?: string;
  taskDescription?: string;
  isDoubleInspectionRequired: boolean;
  workStepReferencesLinks: IReferencesLinkType[];
  taskId?: string | ITaskType;
  projectId?: string;
  projectTaskID?: string;
  ownerId?: string;
  startDate?: Date;
  finishDate?: Date;
  planedStartDate?: Date;
  planedFinishDate?: Date;
  createDate?: Date;
  closeDate?: Date;
  material?: any;
  instrument?: [];
  actions: IActionType[];
  currentAction?: IActionType;
  currentActiveIndex?: any;
  tResources?: string[];
  nrcType?: string[];
  skill?: string[];
  area?: string;
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
    finalAction?: IFinalActionType;
  };
  status: TStatus;
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
}
export type NRCType = 'PIREP' | 'CABIN' | 'MAINT';
export type ScheduledType =
  | 'routine'
  | 'hardTime'
  | 'additional'
  | 'partRepare'
  | '';
