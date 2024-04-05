import { MatRequestAplication } from '@/store/reducers/ProjectTaskSlise';

export interface IPickSlip {
  id?: string;
  _id?: string;
  materials: any[];
  materialAplicationId: string;
  pickSlipNumber?: number;
  status?: TPickSliptatus;
  createDate?: Date;
  closeDate?: Date;
  consigneeName?: string;
  recipient?: string;
  storeMan?: string;
  planeType?: string;
  projectWO?: number | null;
  projectTaskWO?: number | null;
  materialAplicationNumber?: number | null;
  registrationNumber?: string;
  taskNumber?: string;
  additionalTaskId?: number | null;
  additionalTaskID?: number | null;

  store?: string;
  workshop?: string;
  storeManID?: string | null;
  recipientID?: string | null;
  companyID?: string;
  projectTaskID?: any;
  projectID?: any;
  neededOnID: any;
}
export interface IReturnSlip {
  id?: string;
  _id?: string;
  materials: any[];
  materialAplicationId: string;
  pickSlipNumber?: number;
  returnSlipNumber?: number;
  status?: TPickSliptatus;
  createDate?: Date;
  closeDate?: Date;
  consigneeName?: string;
  recipient?: string;
  storeMan?: string;
  planeType?: string;
  projectWO?: number | null;
  projectTaskWO?: number | null;
  materialAplicationNumber?: number | null;
  registrationNumber?: string;
  taskNumber?: string;
  additionalTaskId?: number | null;
  additionalTaskID?: number | null;
  remarks?: any;
  store?: string;
  workshop?: string;
  storeManID?: string | null;
  recipientID?: string | null;
  companyID?: string;
}
export interface IPickSlipResponse {
  materials?: any[];
  pickSlipId?: any;
  id?: string;
  _id?: string;
  materialAplicationId: MatRequestAplication;
  pickSlipNumber?: number;
  status?: TPickSliptatus;
  createDate?: Date;
  closeDate?: Date;
  consigneeName?: string;
  recipient?: string;
  storeMan?: string;
  planeType?: string;
  projectWO?: number | null;
  projectTaskWO?: number | null;
  materialAplicationNumber?: number | null;
  registrationNumber?: string;
  taskNumber?: string;
  additionalTaskID?: number | null;
  store?: string;
  workshop?: string;
  returnSlipNumber?: any;
  neededOn?: string;
  getFrom?: string;
  QRCodeLink?: any;
  neededOnID?: any;
}

export type TPickSliptatus = 'открыто' | 'закрыто' | 'open' | 'closed';
