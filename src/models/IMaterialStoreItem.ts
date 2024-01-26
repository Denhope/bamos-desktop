export interface IMaterialStoreRequestItem {
  STOCK?: string;
  NAME_OF_MATERIAL?: string;
  UNIT_OF_MEASURE?: string;
  PART_NUMBER?: string;
  RACK_NUMBER?: string;
  SHELF_NUMBER?: string;
  QUANTITY: number;
  BATCH?: string;
  BATCH_ID?: string;
  CUSTOMER_MATERIAL?: boolean;
  SERIAL_NUMBER?: string;
  ID?: string;
  RESERVATION?: number;
  PRICE?: string;
  PRODUCT_EXPIRATION_DATE?: Date;
  INVENTORY_ACCOUNT?: string;
  _id?: string;
  id?: string;
  GROUP?: string;
}
