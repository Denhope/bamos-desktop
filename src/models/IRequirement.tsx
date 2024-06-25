import { IRequirementCode, IRequirementType } from './AC';
import { IPartNumber, IVendor } from './IUser';

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
  _id: string;
  id: string;
  projectID?: string;
  neededOnID?: string | any;
  projectTaskID?: string;
  partNumberID?: string | any;
  status?: string;
  description?: string;
  createDate?: string;
  createUserID?: string;
  updateDate?: string;
  updateUserID?: string;
  companyID?: string;
  partRequestNumberNew?: number;
  reqTypesID?: string | IRequirementType;
  reqCodesID?: string | IRequirementCode;
  neededOn?: string;
  availableQTY?: number;
  unAvailableQTY?: number;
  readyStatus?: string;
  amout?: number;
  issuedAmout?: number;
  bookedQuantity?: number;
  reservedQuantity?: number;

  forIssuedQuantity?: number;
  forBookedQuantity?: number;
  cancelledQuntity?: number;
  pickSlipsIds?: any[];
  note?: string;
  serialNumber?: any;
  registrationNumber?: any;
  taskNumber?: string;
  unit?: string;
  group?: string;
  type?: string;
  partNumber?: string;
  issuedQuantity?: number;
  requestQuantity?: number;
  PN?: any;
  nameOfMaterial?: any;
  plannedDate?: any;
}

export interface Requirement {
  partRequestNumberNew: any;
  reqTypesID?: string;
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

export interface IOrder {
  _id: string;
  id: string;
  projectID?: string;
  status?: string;
  description?: string;
  createDate?: string;
  createUserID?: string;
  updateDate?: string;
  updateUserID?: string;
  companyID?: string;
  orderItemsID?: any[];
  parts?: Object[];
  vendorID?: string[];
  orderNumberNew?: number;
  orderTypesID?: string | any;
  orderType?: string;
  note?: string;
  state: string;
  orderName?: string;
  files?: any;
}

export interface IOrderItem {
  allPrice: any;
  partNumberID: any;
  _id?: string;
  id?: string;
  partID?: string | IPartNumber;
  vendorID?: string | IVendor;
  status?: string;
  description?: string;
  createDate?: string;
  createUserID?: string;
  updateDate?: string;
  updateUserID?: string;
  companyID?: string;
  index?: number;
  files?: any[];
  requirementsID?: any[];
  reseivingsItemsIds?: any;
  backorderQty?: number;
  cancelledQTY?: number;
  amout?: number;
  price?: number;
  currency?: string;
  condition?: string;
  leadTime?: number;
  unit?: string;
  nds?: number;
  minQuoted?: number;
  qtyQuoted?: number;
  note?: string;
  orderID?: string | IOrder;
  RECEIVINGS?: any[];
  state: string;
  BATCH?: any;
  SERIAL_NUMBER?: any;
  PRICE?: any;
}
// const convertToTreeData = (orders: IOrder[]): TreeDataNode[] => {
//   return orders.map((order) => {
//     const title = `№:${order.orderNumberNew} - ${order.orderName}`;
//     const vendorNodes = (order.vendorID || []).map((vendorId) => {
//       const vendorOrders = (order.orderItemsID || []).filter(
//         (item) => item.vendorID?._id === vendorId
//       );
//       return {
//         title: vendorOrders[0]?.vendorID?.SHORT_NAME || 'Unknown Vendor',
//         key: `vendor-${order.id}-${vendorId}`,
//         children: vendorOrders.map((vendorOrder, index) => ({
//           title: `POS: ${index + 1}: ${vendorOrder.partID.PART_NUMBER} - ${
//             vendorOrder.amout
//           }${vendorOrder.partID.UNIT_OF_MEASURE}`,
//           key: `${order.id!.toString()}-${vendorId}-${index}`,
//           order: vendorOrder,
//           color: getColor(vendorOrder),
//           children: [
//             {
//               title: (
//                 <div className="flex gap-1">
//                   <DollarOutlined />{' '}
//                   {`${t('PURCHASE PRICE')}:${vendorOrder?.price}` || ''}
//                 </div>
//               ),
//               key: uuidv4(),
//             },
//             {
//               title: `${t('CURRENCY')}:${vendorOrder?.currency}` || '',
//               key: uuidv4(),
//             },
//             {
//               title: `${t('QUANTITY QUOTED')}:${vendorOrder?.qtyQuoted}` || '',
//               key: uuidv4(),
//             },
//             {
//               title: `${t('UNIT OF MEASURE')}:${vendorOrder?.unit}` || '',
//               key: uuidv4(),
//             },
//             {
//               title: `${t('DISCOUNT')}:${vendorOrder?.discount}`,
//               key: uuidv4(),
//             },
//             {
//               title: `CONDITION:${vendorOrder.condition}`,
//               key: uuidv4(),
//             },
//             {
//               title: `${t('LEAD TIME')}:${vendorOrder.leadTime}`,
//               key: uuidv4(),
//             },
//             {
//               title: `${t('FILES')}:`,
//               key: uuidv4(),
//               children: [
//                 ...(vendorOrder?.files?.map((file: any, index: any) => {
//                   return {
//                     title: (
//                       <div className="flex gap-1">
//                         <DownloadOutlined />
//                         {`FILE/${''}${index + 1}:${file.name}`}
//                       </div>
//                     ),
//                     key: file.id,
//                   };
//                 }) || []),
//               ],
//             },
//           ],
//         })),
//       };
//     });

//     return {
//       title,
//       key: `order-${order.id}`,
//       order,
//       children: vendorNodes,
//       color: getColor(order),
//     };
//   });
// };
