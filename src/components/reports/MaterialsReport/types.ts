export interface IMaterialsReportProps {
  results?: {
    workOrder?: {
      id?: string;
      pickSlipID?: string;
      partNumberID?: string;
      projectTaskID?: string;
      WOName?: string;
      station?: string;
      planeId?: {
        acTypeId?: Array<{ code: string }>;
        regNbr?: string;
        serialNbr?: string;
      };
      WONumber?: string;
      startDate?: string;
      endDate?: string;
    };
    materialList?: any[];
  };
  filterParams: {
    WOReferenceID?: string;
    projectID?: string;
    projectTaskID?: string;
    pickSlipNumberNew?: string;
    partNumber?: string;
    neededOnID?: string;
  };
}
