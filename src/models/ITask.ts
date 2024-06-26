import { ITaskType } from "@/types/TypesData";
import { IUser } from "./IUser";

export interface IPlaneTask {
  tasktypeLookup?: "PKGOP" | "SB" | "SMC" | "ADP" | "AD" | "PN";
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
  tasktypeLookup?: "PKGOP" | "SB" | "SMC" | "ADP" | "AD" | "PN";
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
type PlaneType = "ERJ-190" | "737-600/700/800/900" | "RRJ-95";
type Status = "permormed" | "delete" | "in Maintenance";
