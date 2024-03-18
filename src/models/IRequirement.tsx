export enum RequirementStatus {
  OPEN = 'active',
  CLOSED = 'closed',
  ON_QUATATION = 'onQuatation',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  TRANSFER = 'transfer',
  ISSUED = 'issued',
  ON_ORDER = 'onOrder',
  PLANNED = 'planned',
}

export enum RequirementType {
  PART = 'partRequest',
  WORK = 'workRequest',
}

export interface RequirementTypeCode {
  id: string;
  code: string;
  description: string;
  createDate: string;
  createUserID: string;
  updateDate?: string;
  updateUserID?: string;
  companyID: string;
}

export interface IRequirement {
  _id?: string;
  id: string;
  projectID: string;
  projectTaskID: string;
  status?: RequirementStatus;
  description: string;
  createDate: string;
  createUserID: string;
  updateDate?: string;
  updateUserID?: string;
  companyID: string;
}

export interface Requirement {
  _id: string;
  id?: string;
  companyID: string;
  projectID: string;
  projectTaskID: string;
  additionalTaskID: string | null;
  updateUserID: string | null;
  createUserID: string | null;
  planeType: string;
  planeNumber: string;
  companyName: string;
  status: string;
  createBy: string | null;
  updateBy: string | null;
  createDate: Date;
  optional: string | null;
  updateDate: Date | null;
  projectTaskWO: number;
  additionalTaskWO: number | null;
  taskWO?: number;
  projectWO?: number;
  partRequestNumber: number;
  taskNumber: string | null;
  PN?: string;
  nameOfMaterial: string;
  alternative: any | null;
  unit?: string;
  amout?: number;
  group: string;
  type?: string;
  quantityOnTaskBase: number;
  amtoss: string | null;
  isEdited?: string | null;
  rewiewStatus: string | null;
  cascader: any[];
  requestQuantity: string | null;
  materialOrders?: any[];
  issuedQuantity: string | null;
  issuedItems: any[];
  needOnLocationShop: string | null;
  dueDate: Date | null;
  plannedDate: string | null;
  neededOn: string;
  availableQTY?: number;
  unAvailableQTY?: number;
  readyStatus?: string;
  requirementType?: RequirementType;
  remarks?: string;
  children?: Requirement[]; // Добавляем свойство children
}
export interface IDeleteRequirementsByIds {
  ids: any[];
  projectID: string;
  createDate: string;
  createUserID: string;
  updateDate?: string;
  updateUserID?: string;
  companyID?: string;
}

export interface IRequirementGroup {
  id: string;
  title: string;
  description: string;
  createDate: string;
  createUserID: string;
  updateDate?: string;
  updateUserID?: string;
  companyID?: string;
  requirements?: IRequirement[];
  remarks?: string;
  requirementType?: RequirementType;
}
