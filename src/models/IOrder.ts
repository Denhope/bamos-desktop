export interface IOrder {
  partsToPrint?: any[];
  orderText?: any;
  files?: any[];
  vendors?: any[];
  id?: string;
  companyID?: any;
  projectWO?: any;
  projectID?: any;
  _id?: string;
  orderNumber: any;
  registrationNumber?: any;
  customer?: any;
  planeType?: any;
  orderName?: string;
  state?: TOrderStatus;
  adress?: string;
  description?: string;
  createDate?: Date;
  closeDate?: Date;
  type?: OrderType;
  orderType: OrderType;
  orderId?: string;
  parts?: any[];
  сostType?: ActivityType;
  shipTo?: any;
  supplier?: any;
  SUPPLIER_SHORT_NAME?: any;
  SUPPLIES_LOCATION?: any;
  SUPPLIES_CODE?: any;
  projectNumbers?: any;
  startDate?: any;
  finishDate?: any;
  orderItemsID?: any;
  orderNumberNew?: any;
}
export type TOrderStatus =
  | 'ARRIVED'
  | 'CLOSED'
  | 'MISSING'
  | 'OPEN'
  | 'OPEN_AND_TRANSFER'
  | 'PARTLY_ARRIVED'
  | 'PARTLY_MISSING'
  | 'PARTLY_SENT'
  | 'PARTLY_RECEIVED'
  | 'READY'
  | 'PARTLY_READY'
  | 'SENT'
  | 'TRANSFER'
  | 'UNKNOWN'
  | 'RECEIVED'
  | 'CANCELLED'
  | 'RECEIVED'
  | 'onQuatation'
  | 'open';
export type OrderType =
  | 'PURCHASE_ORDER'
  | 'REPAIR_ORDER'
  | 'CUSTOMER_REPAIR_ORDER'
  | 'CUSTOMER_REPAIR_RETURN_ORDER'
  | 'LOAN_ORDER'
  | 'EXCHANGE_ORDER'
  | 'EXCHANGE_IN_ADVANCE_ORDER'
  | 'QUOTATION_ORDER'
  | 'RETURN_DELIVERY_ORDER'
  | 'SALES_ORDER'
  | 'CUSTOMER_LOAN_ORDER'
  | 'CUSTOMER_PROVISION_ORDER'
  | 'CUSTOMER_PROVISION_RETURN_ORDER'
  | 'SERVICE_ORDER'
  | 'INCOMING_REQUEST_ORDER'
  | 'INCOMING_REQUEST_IN_ADVANCE_ORDER'
  | 'INCOMING_REQUEST_IN_ADVANCE_RETURN_ORDER'
  | 'OUTGOING_REQUEST_ORDER'
  | 'OUTGOING_REQUEST_IN_ADVANCE_ORDER'
  | 'OUTGOING_REQUEST_RETURN_ORDER'
  | 'POOL_REQUEST_ORDER'
  | 'POOL_REQUEST_RETURN_ORDER'
  | 'POOL_REQUEST_EXCHANGE_ORDER'
  | 'WARRANTY_ORDER'
  | 'MATERIAL_PRODUCTION_ORDER'
  | 'SB_ORDER'
  | 'LOAN_RETURN_ORDER'
  | 'EXCHANGE_IN_ADVANCE_RETURN_ORDER'
  | 'CONSIGNMENT_STOCK_INCOMING_ORDER'
  | 'CONSIGNMENT_STOCK_PURCHASE_ORDER'
  | 'BUYER_FURNISHED_EQUIPMENT_ORDER'
  | 'TRANSFER_ORDER'
  | 'CONSIGNMENT_STOCK_RETURN_ORDER';
export type ActivityType =
  | 'MAINTENANCE'
  | 'MODIFICATION'
  | 'REPAIR'
  | 'TRANSPORTATION';
