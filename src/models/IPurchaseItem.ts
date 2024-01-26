export interface IPurchaseItem {
  id?: string;
  _id?: string;
  pickSlipNumber?: number;
  status?: TPurchaseItemSliptatus;
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
  store?: string;
  workshop?: string;
}
// export interface IPurchaseItemResponse {
//   materials?: any[];
//   pickSlipId?: any;
//   id?: string;
//   _id?: string;
//   materialAplicationId: MatRequestAplication;
//   pickSlipNumber?: number;
//   status?: TPickSliptatus;
//   createDate?: Date;
//   closeDate?: Date;
//   consigneeName?: string;
//   recipient?: string;
//   storeMan?: string;
//   planeType?: string;
//   projectWO?: number | null;
//   projectTaskWO?: number | null;
//   materialAplicationNumber?: number | null;
//   registrationNumber?: string;
//   taskNumber?: string;
//   additionalTaskId?: number | null;
//   store?: string;
//   workshop?: string;
// }

export type TPurchaseItemSliptatus = 'new' | '';
