import { ITaskType } from "@/types/TypesData";
import { IUser } from "./IUser";

export interface IPlaneWO {
  _id?: string;
  id?: string;
  planeID?: string;
  dateIn?: Date;
  dateOut?: Date;
  dateClose?: Date;
  dateCreate?: Date;
  department?: "MAINTENANCE" | "OPERATIONS";
  classification?: "SCHEDULED" | "UNSCHEDULED";
  description?: string;
  WOType?: "PLANNED" | "UNPLANNED";
  companyID?: string;
  status?: "OPEN" | "C/W" | "CANCELLED" | "RTS PENDING" | "RTS OVERDUE";
  taskNbr?: string;
  regNbr?: string;
  WONbr?: string;
  station?: string;
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
  userID?: string;
  disposition?: string;
}
