import { IPartNumber } from '@/models/IUser';

export function getData(): IPartNumber[] {
  return [
    {
      id: 1,
      status: 'Active',
      _id: '1',
      PART_NUMBER: 'PN001',
      DESCRIPTION: 'Part Description 1',
      TYPE: 'Type 1',
      GROUP: 'Group A',
      UNIT_OF_MEASURE: 'UOM1',
      UNIT_OF_MEASURE_LONG: 'Unit of Measure 1',
      ADD_DESCRIPTION: 'Additional Description 1',
      ADD_UNIT_OF_MEASURE: true,
      STATUS: 'In Stock',

      DEFAULT_SUPPLIER: 'Supplier 1',
      PART_PICKSLIP_REMARKS: 'Remark 1',
      PART_RECEIVING_REMARKS: 'Receiving Remark 1',

      PART_PURCHASE_REMARKS: 'Purchase Remark 1',
      COUNTRY_OF_ORIGIN: 'Country 1',
      RESOURCE_TYPE: 'Resource 1',
      companyID: 'CompanyID1',
      createDate: new Date(),
      createUserID: 'User1',
      updateDate: new Date(),
      updateUserID: 'User1',
      acTypeID: 'ACType1',
      QUANTITY: 1,
    },
    {
      id: 2,
      status: 'Active',
      _id: '2',
      PART_NUMBER: 'PN002',
      DESCRIPTION: 'Part Description 2',
      TYPE: 'Type 2',
      GROUP: 'Group B',
      UNIT_OF_MEASURE: 'UOM2',
      UNIT_OF_MEASURE_LONG: 'Unit of Measure 2',
      ADD_DESCRIPTION: 'Additional Description 2',
      ADD_UNIT_OF_MEASURE: false,
      STATUS: 'In Stock',

      DEFAULT_SUPPLIER: 'Supplier 2',
      PART_PICKSLIP_REMARKS: 'Remark 2',
      PART_RECEIVING_REMARKS: 'Receiving Remark 2',

      PART_PURCHASE_REMARKS: 'Purchase Remark 2',
      COUNTRY_OF_ORIGIN: 'Country 2',
      RESOURCE_TYPE: 'Resource 2',
      companyID: 'CompanyID2',
      createDate: new Date(),
      createUserID: 'User2',
      updateDate: new Date(),
      updateUserID: 'User2',
      acTypeID: 'ACType2',
      QUANTITY: 1,
    },
    // Добавьте больше элементов по аналогии
  ];
}
