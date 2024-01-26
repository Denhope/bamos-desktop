import { ITaskDTO } from "@/components/mantainance/base/workPackage/packageAplications/AddAplicationForm";
import { IPlaneType } from "@/models/IAdditionalTask";
import { IWorkNeed } from "@/models/IProjectTask";

export interface ITaskType {
  allTaskData?: number;
  taskNumber?: string;
  area?: string | number;
  access?: string | any;
  code?: string;
  taskDescription?: string;
  startOfWork?: string;
  workInterval?: string;
  amtoss?: string;
  workerNumber?: number;
  specialization?: string;
  prepareTaskTime?: number;
  allTaskTime?: any;
  applicability?: any;
  aircraftModel?: any;
  note?: any;
  mainWorkTime?: number;
  codeOfChange?: string;
  document?: string;
  FEC?: any;
  vip?: any;
  componentsPartNumber?: any;
  id?: any;
  _id?: any;
  workNeed?: IWorkNeed;
  accessArr?: string[] | any;
  hardAccess?: string[] | any;
  zonesArr?: string[] | any;
  ammtossArr?: string[] | [];
  amtossArr?: string[] | [];
  ammtossArrNew?: string[] | any;
  amtossNewRev?: string;
  isDoubleInspectionRequired?: boolean;
  WOCustomer?: string;
  MJSSNumber?: string;
  dtoIndex?: string;
  amtossDTO?: string;
  taskDescriptionDTO?: string;
  taskNumberDTO?: string;
  WOPackageType?: string;
  positionDTO?: string;
  noteDTO?: string;
  position?: string;
  intervalMOS?: number;
  intervalHRS?: number;
  intervalAFL?: number;
  intervalAPUS?: number;
  intervalENC?: number;
}
export interface ITaskTypeUpdate {
  allTaskData?: number;
  taskNumber?: string;
  area?: string | number;
  access?: string | any;
  code?: string;
  taskDescription?: string;
  startOfWork?: string;
  workInterval?: string;
  amtoss?: string;
  workerNumber?: number;
  specialization?: string;
  prepareTaskTime?: number;
  allTaskTime?: any;
  applicability?: any;
  aircraftModel?: any;
  note?: any;
  mainWorkTime?: number;
  codeOfChange?: string;
  document?: string;
  FEC?: any;
  vip?: any;
  componentsPartNumber?: any;
  id?: any;
  workNeed?: IWorkNeed;
  accessArr?: string[] | any;
  hardAccess?: string[] | any;
  zonesArr?: string[] | any;
  ammtossArr?: string[] | [];
  amtossArr?: string[] | [];
  isDoubleInspectionRequired?: boolean;
  WOCustomer?: string;
  MJSSNumber?: string;
  WOPackageType?: string;
  position?: string;
  intervalMOS?: number;
  intervalHRS?: number;
  intervalAFL?: number;
  intervalAPUS?: number;
  intervalENC?: number;
}
export interface IDTO {
  id?: number;
  taskNumber: string;
  taskDescription?: string;
  amtoss?: string;
  note?: string;
  WOCustomer?: string;
  WOPackageType?: string;
  position?: string;
}

export interface IMatData {
  taskNumber: string;
  startOfWork?: string;
  workInterval?: string;
  amtoss?: string;
  code?: string;
  PN?: string;
  nameOfMaterial: string;
  amout: number;
  unit: string;
  alternative?: string;
  note?: string;
  note1?: string;
}
export interface IMatData1 {
  id?: any;
  taskNumber?: string;
  startOfWork?: string;
  workInterval?: string;
  amtoss?: string;
  code?: string;
  PN?: string;
  nameOfMaterial?: string;
  alternative?: any;
  amout: number;
  unit: string;
  note?: string;
  note1?: string;
  isEdited?: boolean;
  isOnonPurchase?: boolean;
}
export interface IPurchaseMaterial {
  id?: any;
  _id?: any;
  taskId?: string;
  taskNumber?: string;
  startOfWork?: string;
  workInterval?: string;
  amtoss?: string;
  code?: string;
  PN?: string;
  nameOfMaterial?: string;
  alternative?: any;
  amout: number;
  unit: string;
  taskWO?: number;
  consignee?: string;
  registrationNumber?: string;
  planeNumber?: string;
  materialAplicationNumber?: number | null;
  projectWO?: number | null;
  plane?: IPlaneType;
  status?:
    | "new"
    | "Не обработано"
    | "Подтверждено"
    | "Отменено"
    | "Сбор предложений"
    | "Ожидание оплаты"
    | "Ожидание поставки"
    | "Томоженное оформление"
    | "На складе"
    | "Поставка заказчиком";
  createDate?: Date;
  realeseDate?: Date | string;
  onPurchaseDate?: Date | string;
  onReleaseMan?: string;
  onPurchaseMan?: string;
  storeMan?: string;
  note?: string;
}

export interface IMatDataAdditional {
  code?: string;
  PN?: string;
  nameOfMaterial?: string;
  amout?: number;
  unit?: string;
  id?: number;
  alternative?: string;
  note?: string;
  note1?: string;
}

export interface IInstData {
  taskNumber: string;
  startOfWork?: string;
  workInterval?: string;
  amtoss?: string;
  code?: string;
  PN?: string;
  nameOfInstrument?: string;
  amout?: any;
  unit?: string;
  alternative?: string;
  note?: string;
  note1?: string;
}

export interface IInstData1 {
  id?: string;
  taskNumber?: string;
  startOfWork?: string;
  workInterval?: string;
  amtoss?: string;
  code?: string;
  PN?: string;
  nameOfInstrument?: string;
  amout?: any;
  unit?: string;
  alternative?: string;
  note?: string;
  note1?: string;
}

export interface IAplicationData {
  id: any;
  name: string;
  taskLIst: IDTO[];
}
export interface IAplicationInfo {
  id?: any;
  _id?: any;
  aplicationName: string;
  serviceType: string;
  planeID?: string;
  planeNumber?: string;
  planeType?: string;
  companyID: string;
  companyName?: string;
  dateOfAplication?: any;
  tasks?: ITaskDTO[];
  routineTasks?: any;
  additionalTasks?: any;
  hardTimeTasks?: any;
  isCreatedProject?: boolean;
  ownerId?: string;
  projectId?: string;
  projectWO?: number;
}

export interface IProjectInfo {
  projectId?: string;
  projectName: string;
  aplicationId: {};
  planedStartDate?: Date;
  planedFinishDate?: Date;
  startDate?: Date;
  finishDate?: Date;
  // status:
  optional?: {
    isRoutineTaskCreated?: boolean;
    isAdditionalTaskCreated?: boolean;
    isHardTimeTasksCreated?: boolean;
    isStarting?: boolean;
    isFavorite?: boolean;
    isDone?: boolean;
    isActive?: boolean;
  };
  ownerId: string;
  createDate?: Date;
}

export interface IAditionalTask {
  projectTaskId: string;
}

export interface IPanelDTO {
  panel: string;
  description?: string;
  area?: any;
  openingTime?: any;
  openingSkill?: string;
  closingTime?: any;
  closingSkill?: string;
  id?: string;
}
export interface IPanelDTO2 {
  panel: string;
  description?: string;
}

export interface IPanelDTO1 {
  access: string;
}

export interface IAreaDTO {
  zone?: string;
  description?: string;
}

export interface IInspectionScopeDTO {
  taskNumber: string;
  inspectionScope?: string;
}

export interface IAmtossNewData {
  ammtossOld: string;
  ammtossNew: string;
  description: string;
}
