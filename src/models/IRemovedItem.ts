import { MatRequestAplication } from "@/store/reducers/ProjectTaskSlise";
import { IPlaneType } from "./IAdditionalTask";
import { IPanelDTO } from "@/types/TypesData";

export interface IRemovedItemResponce {
  id?: string;
  _id?: string;
  panelId?: IPanelDTO;
  projectId?: string;
  projectTaskId?: string;
  additionalTaskId?: string;
  removeItem?: any;
  removeItemName?: string;
  removeItemNumber?: string;
  installItemNumber?: string;
  referenceSum?: string[];
  area?: string;
  zone?: string;
  description?: string;
  position?: string;
  pickSlipNumber?: number;
  status?: TRemovedItemsStatus;
  consigneeName?: string;
  recipient?: string;
  storeMan?: string;
  plane?: IPlaneType;
  projectWO?: number | null;
  projectTaskWO?: number | null;
  additionalTaskWO?: number | null;
  removeMan?: any;
  installMan?: any;
  registrationNumber?: string;
  taskNumber?: string;
  removeDate?: string;
  installDate?: string;
  installName?: string;
  removeName?: string;
  reference?: string | number;
}

export type TRemovedItemsStatus = "open" | "close";
// | 'открыто'
// | 'закрыто'
// | 'снято'
// | 'установлено';
