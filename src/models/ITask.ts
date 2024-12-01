import { ITaskType } from '@/types/TypesData';
import { IUser } from './IUser';
import { IACType } from './AC';

export interface IPlaneTask {
  tasktypeLookup?: 'PKGOP' | 'SB' | 'SMC' | 'ADP' | 'AD' | 'PN';
  planeID: IPlane;
  companyID?: string;
  status: Status;
  taskNbr: string;
  regNbr?: string;
  amtoss?: string;
  ata?: string;
  workOrderNbr?: string;
  taskWorkOrderNbr?: string;
  packageNbr?: string;
  partNbr?: string;
  partSerialNbr?: string;
  station?: string;
  description?: string;
  taskID?: ITaskType;
  workOrderID?: string;
  completeHRS?: string; //'1968:43' наработка при последнем выполнении;
  completeAFL?: number; //посадки при последнем выполнении 604;
  completeDAYS?: Date; //'18-May-23'дата последнего выполнения;
  completeAPUS?: number; //  2095 циклы ВСУ последего выполнения
  completeHRSAPUS?: string; //  2095:43  наработка ВСУ последего выполнения
  completeENC?: number; //578 циклы двигателя последего выполнения
  completeHRSENG?: string; //'1968:43' наработка Двигателя при последнем выполнении;
  updateDate?: Date; //'18-May-23'дата внесения;
  technical?: IUser;
  inspector?: IUser;
  operator?: IUser;
  disposition?: string;

  // isLastCompleteTask?: boolean;
  nextDueMOS?: Date; ///"12-Sep-27",
  nextDueHRS?: string; //"4847:22",
  nextDueAFL?: number; //2078 посадки
  nextdueAPUS?: number; //циклы ВСУ 2078
  nextDueDAYS?: string;
  nextDueENC?: number; // циклы двигателя 456
  intervalMOS?: number; //месяцы
  intervalHRS?: number;
  intervalAFL?: number;
  intervalAPUS?: number;
  intervalENC?: number;
  intervalDAYS?: number;
  dueTaskList?: [
    {
      workOrderID?: string;
      planeID: IPlane;
      taskNbr?: string;
      packageNbr?: string;
      partNbr?: string;
      partSerialNbr?: string;
      completeHRS?: string; //'1968:43' наработка при последнем выполнении;
      completeAFL?: number; //посадки при последнем выполнении 604;
      completeDAYS?: Date; //'18-May-23'дата последнего выполнения;
      completeAPUS?: number; //  2095 циклы ВСУ последего выполнения
      completeHRSAPUS?: string; //  2095:43  наработка ВСУ последего выполнения
      completeENC?: number; //578 циклы двигателя последего выполнения
      completeHRSENG?: string; //'1968:43' наработка Двигателя при последнем выполнении;
      updateDate?: Date; //'18-May-23'дата внесения;
      technical?: IUser;
      inspector?: IUser;
      operator?: IUser;
      station?: string;
      isLastCompleteTask?: boolean;
    }
  ];
}

export interface ICompletePrevItemResponce {
  taskNumber: string;
  workOrderNbr?: string;
  taskWorkOrderNbr?: string;
  completeHRS?: string; //'1968:43' наработка при последнем выполнении;
  completeAFL?: number; //посадки при последнем выполнении 604;
  completeDAYS?: Date; //'18-May-23'дата последнего выполнения;
  completeAPUS?: number; //  2095 циклы ВСУ последего выполнения
  completeHRSAPUS?: string; //  2095:43  наработка ВСУ последего выполнения
  completeENC?: number; //578 циклы двигателя последего выполнения
  completeHRSENG?: string; //'1968:43' наработка Двигателя при последнем выполнении;
  partNbr?: string;
  partSerialNbr?: string;
  packageNbr?: string;
  technical?: IUser;
  inspector?: IUser;
}

export interface IPlaneTaskResponce {
  id?: string;
  _id?: string;
  pkNbr?: string;
  pkDescription?: string;
  pkID?: string;
  toleranceAFL?: number;
  toleranceMOS?: number;
  toleranceMHS?: string;
  tasktypeLookup?: 'PKGOP' | 'SB' | 'SMC' | 'ADP' | 'AD' | 'PN';
  planeID?: IPlane;
  companyID?: string;
  status?: Status;
  taskNbr?: string;
  regNbr?: string;
  amtoss?: string;
  ata?: string;
  workOrderNbr?: string;
  taskWorkOrderNbr?: string;
  packageNbr?: string;
  partNbr?: string;
  partSerialNbr?: string;
  station?: string;
  description?: string;
  taskID?: ITaskType;
  workOrderID?: string;
  completeHRS?: string; //'1968:43' наработка при последнем выполнении;
  completeAFL?: number; //посадки при последнем выполнении 604;
  completeMOS?: Date; //'18-May-23'дата последнего выполнения;
  completeAPUS?: number; //  2095 циклы ВСУ последего выполнения
  completeHRSAPUS?: string; //  2095:43  наработка ВСУ последего выполнения
  completeENC?: number; //578 циклы двигателя последего выполнения
  completeHRSENG?: string; //'1968:43' наработка Двигателя при последнем выполнении;
  updateDate?: Date; //'18-May-23'дата внесения;
  technical?: IUser;
  inspector?: IUser;
  operator?: IUser;
  disposition?: string;
  position?: string;

  // isLastCompleteTask?: boolean;
  nextDueMOS?: Date; ///"12-Sep-27",
  nextDueHRS?: string; //"4847:22",
  nextDueAFL?: number; //2078 посадки
  nextdueAPUS?: number; //циклы ВСУ 2078
  nextDueDAYS?: string;
  nextDueENC?: number; // циклы двигателя 456
  intervalMOS?: number; //месяцы
  intervalHRS?: number;
  intervalAFL?: number;
  intervalAPUS?: number;
  intervalENC?: number;
  intervalDAYS?: number;
  dueTaskList?: [
    {
      workOrderID?: string;
      planeID: IPlane;
      taskNbr?: string;
      packageNbr?: string;
      partNbr?: string;
      partSerialNbr?: string;
      completeHRS?: string; //'1968:43' наработка при последнем выполнении;
      completeAFL?: number; //посадки при последнем выполнении 604;
      completeDAYS?: Date; //'18-May-23'дата последнего выполнения;
      completeAPUS?: number; //  2095 циклы ВСУ последего выполнения
      completeHRSAPUS?: string; //  2095:43  наработка ВСУ последего выполнения
      completeENC?: number; //578 циклы двигателя последего выполнения
      completeHRSENG?: string; //'1968:43' наработка Двигателя при последнем выполнении;
      updateDate?: Date; //'18-May-23'дата внесения;
      technical?: IUser;
      inspector?: IUser;
      operator?: IUser;
      station?: string;
      isLastCompleteTask?: boolean;
    }
  ];

  completeHRSENC?: string; //'1968:43' наработка Двигателя при последнем выполнении;

  timeRemainingDAYS?: number; // "1515 d", оставшееся время дни
  timeRemainingMOS?: number | string;
  timeRemainingHRS?: string; // оставшееся часы "2856:19",
  timeRemainingAFL?: number; //оставшееся посадки "2856:19",
  timeRemainingAPUS?: string; //оставшееся циклы ВСУ "2856",
  timeRemainingHRSENC?: string; //оставшееся часы двигателя "2856:19",
  timeRemainingHRSAPUS?: string; //оставшееся часы ВСУ "2856",
  timeRemainingENC?: string; //оставшееся циклы двигателя "2856:19",

  //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&????????????????????

  timeAccruedMOS?: string; // "1515 d", пройденное вреия
  timeAccruedDAYS?: string; //пройденное вреия
  timeAccruedHRS?: number;
  timeAccruedHRSENC?: string; //пройденное вреиядвигателя "2856:19",
  timeAccruedHRSAPUS?: string; //пройденное вреия часы ВСУ "2856",
  timeAccruedAFL?: number;
  timeAccruedAPUS?: number;
  timeAccruedENC?: number;

  //??????????????????????????????????????????????????????
  tsnMOS?: number; // "Tsn-MOS"?: number
  tsnHRS?: number; // "Tsn-HRS"?: number
  tsnAFL?: number; //"Tsn-AFL"?: number

  maxLimitMOS?: Date; //"09-Jun-24", max Date
  maxLimitHRS?: string; //"2998:43",max часы
  maxLimitHRSENG?: string; //"2998:43",max часы двигателя
  maxLimitHRSAPUS?: string; //"2998:43",max часы ВСУ
  maxLimitAFL?: number; //2355,  max посадкиы
  adjustment?: number; //корректировка -5 дней

  effectiveDate?: Date; //Дата вступления в силу документа
  estimatedDueDate?: Date; //Предпологаемая дптв
}

export interface IPlane {
  regNbr: string;
  serialNumber: string;
  type: PlaneType;
  eng1: { serialNumber: string };
  eng2: { serialNumber: string };
  eng3: { serialNumber: string };
  eng4: { serialNumber: string };
  apu: { serialNumber: string };

  utilisation: {
    ACTimes: { date: Date; HRS: string; AFL: number };
    eng1?: { date: Date; HRS: string; AFL: number };
    eng2?: { date: Date; HRS: string; AFL: number };
    eng3?: { date: Date; HRS: string; AFL: number };
    eng4?: { date: Date; HRS: string; AFL: number };
  };
}
type PlaneType = 'ERJ-190' | '737-600/700/800/900' | 'RRJ-95';
type Status = 'permormed' | 'delete' | 'in Maintenance';

export interface ITaskCode {
  _id: string;
  id: string;
  title: string;
  code: string;
  description: string;
  createDate: string;
  createUserID: string;
  updateDate?: string;
  updateUserID?: string;
  companyID: string;
  acTypeId: string;
  acTypeTitle: string;
}

export interface IMPD {
  id: string;
  title: string;
  code: string;
  description: string;
  createDate: string;
  createUserID: string;
  updateDate?: string;
  updateUserID?: string;
  companyID: string;
  acTypeId: string;
}

export interface ITaskCodeGroup {
  acTypeId: string;
  acTypeTitle: string;
  tasksCodes: ITaskCode[] | [];
}

export interface IZoneCode {
  accessCodes?: IAccessCode[];
  id: string;
  _id?: string;
  majoreZoneNbr: number;
  majoreZoneDescription: string;
  majoreZoneShortDescription: string;
  subZoneNbr?: number;
  subZoneDescription?: string;
  subZoneShortDescription?: string;
  areaNbr?: string | number;
  accessNbr?: string | number;
  areaDescription?: string;
  accessDescription?: string;
  acTypeId: string;
  accessID?: string;
  areaCodeID?: string;
  acTypeTitle: string;
  acType: string;
  createDate: string;
  createUserID: string;
  updateDate?: string;
  updateUserID?: string;
  companyID: string;
  status?: string;
}
export interface ISubZoneCode extends IZoneCode {
  areasCode?: IZoneCode[];
}
export interface IAreaCode extends IZoneCode {}

export interface IZoneCodeGroup extends IZoneCode {
  subZonesCode?: ISubZoneCode[];
}

export interface IAreaCode {
  id: string;
  majoreZoneNbr: number;
  majoreZoneDescription: string;
  majoreZoneShortDescription: string;
  subZoneNbr?: number;
  subZoneDescription?: string;
  subZoneShortDescription?: string;
  areaNbr?: string | number;
  areaDescription?: string;
  accessNumber?: string | number;
  accessDescription?: string;
  acTypeId: string;
  acTypeTitle: string;
  acType: string;
  createDate: string;
  createUserID: string;
  updateDate?: string;
  updateUserID?: string;
  companyID: string;
  zoneCodeId: string;
  status?: string;
}

export interface IAccessCode {
  accessProjectNumber: any;
  isAddAccess?: boolean;
  areaCode: any;
  _id: any;
  accessNbr: any;
  id: string;
  majoreZoneNbr: number;
  majoreZoneDescription: string;
  majoreZoneShortDescription: string;
  subZoneNbr?: number;
  subZoneDescription?: string;
  subZoneShortDescription?: string;
  areaNbr?: string | number;
  areaDescription?: string;
  accessDescription?: string;
  acTypeId: string;
  acTypeTitle: string;
  acType: string;
  createDate: string;
  createUserID: string;
  updateDate?: string;
  updateUserID?: string;
  companyID: string;
  zoneCodeId: string;
  areaCodeId: string;
  accessNumber?: string | number;
  accessCodeId: string;
  status?: string;
  accesses?: any[];
  projectTaskIds?: IProjectTask[];
}

export interface IProjectTask {
  _id: string;
  taskNumber: string;
  taskWO: string;
  projectTaskWO: string;
  taskDescription: string;
  taskType: string;
}

export interface ITaskResponce {
  taskNumber?: string;
  id: any;
  description: string;
  createDate: string;
  createUserID: string;
  updateDate?: string;
  updateUserID?: string;
  companyID: string;
  acTypeId?: IACType;
  zonesID?: IAreaCode[];
  accessID?: any[];
  taskCodeId?: ITaskCode;
  taskType?: 'AC_TASK' | 'COMMON_TASK';
  workerNumber?: number;
  specialization?: string;
  prepareTaskTime?: number;
  allTaskTime?: number;
  applicability?: any;
  workInterval?: string;
  amtoss?: string;
  document?: string;
  taskDepartment?: 'sceduledTask' | 'piper' | '';
  revision?: any;
  mpdDocumentationId?: any;
  preparationCode?: any;
}
export interface ITask {
  isCriticalTask?: boolean;
  reference?: any[];
  mainWorkTime: any;
  _id: any;
  instrumentID: any;
  partNumberID: any;
  partNumber: any;
  taskDescription: any;
  taskNumber?: string;
  id?: any;
  description: string;
  createDate: any;
  createUserID: any;
  updateDate?: string;
  updateUserID?: any;
  companyID: string;
  acTypeId?: IACType | string;
  zonesID?: IAreaCode[] | string[];
  accessID?: any[];
  taskCodeId?: string;
  ata?: any;
  // taskType?: 'AC_TASK' | 'COMMON_TASK';
  workerNumber?: number;
  specialization?: string;
  prepareTaskTime?: number;
  allTaskTime?: number;
  applicability?: any;
  workInterval?: string;
  amtoss?: string;
  document?: string;
  taskDepartment?: 'sceduledTask' | 'piper' | '';
  revision?: any;
  mpdDocumentationId?: any;
  note?: any;
  isDoubleInspectionRequired?: boolean;
  position?: string;
  intervalMOS?: number; //месяцы
  intervalHRS?: number;
  intervalAFL?: number;
  intervalAPUS?: number;
  intervalENC?: number;
  intervalDAYS?: number;
  preparationCode?: any;
  toleranceAFL?: number;
  toleranceMOS?: number;
  toleranceDAY?: number;
  toleranceMHS?: string;
  status?: string;
  quantity?: any;
  taskType?:
    | 'SB'
    | 'SMC'
    | 'ADP'
    | 'AD'
    | 'PN'
    | 'PART_PRODUCE'
    | 'NRC'
    | 'ADD_HOC';
}
