export interface IStore {
  id?: string;
  _id?: string;
  status?: TStoreStatus;
  shopShortName?: string;
  shopLongName?: string;
  adress?: string;
  description?: string;
  station?: 'MSQ' | 'SMQ' | 'ORSHA' | 'BARN';
  createDate?: Date;
  closeDate?: Date;
  country?: string;
  companyID?: string;
  storeManOwner?: string;
  locations?: IStoreLocation[] | [];
  ownerShotName?: string;
  ownerLongName?: string;
  ownerId?: string;
  remarks?: string;
  owner?: string;
  files?: any[];
}
export interface IStoreLocation {
  id?: string;
  _id?: string;
  locationName: string;
  description:
    | 'LOCATION_FOR_UNSERVICEABLE_PARTS'
    | 'LOCATION_FOR_PARTS_IN_HANGAR'
    | 'LOCATION_FOR_PARTS_IN_INVENTORY'
    | 'LOCATION_FOR_SERVICEABLE_PARTS'
    | 'LOCATION_FOR_PARTS_TO_SCRAP'
    | 'LOCATION_FOR_PARTS_IN_QUARANTINE'
    | 'LOCATION_FOR_PARTS_ON_ROLLOUT'
    | 'LOCATION_FOR_PARTS_IN_SHOP'
    | 'QUAR_LOCATION'
    | 'DROP_LOCATION';
  storageType?: 'manual' | 'auto';
  rectriction: TRestrictionStore;
  locationType: TLocationStore;
  owner?: string;
  ownerID?: string;
  remarks?: string;
  ownerLongName?: string;
  ownerShotName?: string;
}

export type TStoreStatus = 'active' | 'unActive' | 'block';
export type TRestrictionStore = 'standart' | 'inaccessible' | 'restricted';
export type TLocationStore =
  | 'standart'
  | 'hangar'
  | 'inventory'
  | 'quarantine'
  | 'rollOut'
  | 'scrap'
  | 'shipment'
  | 'transfer'
  | 'shop'
  | 'unserviceable'
  | 'reservation'
  | 'inventory'
  | 'customer'
  | 'consingment'
  | 'pool'
  | 'tool'
  | 'arhive'
  | 'moving';
