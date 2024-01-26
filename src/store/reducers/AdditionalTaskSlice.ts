// @ts-nocheck
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import {
  IAdditionalTask,
  IMatPrintItem,
  IReferencesLinkType,
  IResourcesRequests,
  NRCType,
  ScheduledType,
  TStatus,
} from "@/models/IAdditionalTask";
import { IMatData1, IMatDataAdditional } from "@/types/TypesData";
import {
  createNRC,
  featchCountAdditionalByStatus,
  getAllAdditionalTaskAplications,
  getAllAdditionalTaskMaterialsForStatistic,
  updateAdditionalTask,
} from "@/utils/api/thunks";
import { ICountStatus, MatRequestAplication } from "./ProjectTaskSlise";
export type IActiveActionProps = {
  id: number;
  payload: IActionType;
};
export type IActiveActionCreateDateProps = {
  id: number;
  payload: Date;
};
export type IWOModeType = {
  isProjectTaskMode: boolean;
};
export type IActionType = {
  actionDescription?: string;
  description?: string;
  performedSing?: string | null;
  performedDate?: string | null;
  performedTime?: any;
  performedName?: string | null;
  inspectedDate?: string | null;
  inspectedTime?: string;
  inspectedSing?: string | null;
  inspectedName?: string;
  actionNumber?: any;
  doubleInspectionSing?: string | null;
  doubleInspectedDate?: string | null;
  doubleInspectedTime?: string;
  doubleInspectedName?: string | null;
  cteateDate?: any | null;
  actionCteateUserID?: any | null;
  updateDate?: any | null;
  actionUpdateUserID?: string | null;
  isPartsRepareTask?: boolean;
  partsOffOnArr?: [];
  isTrasferTask?: boolean;
  transferTaskObj?: {};
  createDate?: Date;
  inspectionAction?: any;
  createById?: any;
  createUser?: any;
  updateById?: any;
};

type AdditionalTaskState = {
  WOMode: IWOModeType;
  additionalTasks: IAdditionalTask[];
  currentAdditionalTask: IAdditionalTask;
  isLoading: boolean;
  additionalTasksFetchError: string | null;
  countAdditionalByStatus: ICountStatus;
};
export const initialAdditionalTask: IAdditionalTask = {
  resourcesRequests: [],
  isDoubleInspectionRequired: false,
  workStepReferencesLinks: [],
  status: "отложен",
  actions: [],
  currentAction: {
    actionDescription: "",
    performedSing: "",
    performedName: "",
    doubleInspectedName: "",
    inspectedName: "",

    inspectedSing: undefined,
    inspectedDate: undefined,
    inspectedTime: undefined,
    doubleInspectionSing: undefined,
    doubleInspectedDate: undefined,
    doubleInspectedTime: undefined,
    isPartsRepareTask: false,
    isTrasferTask: false,
  },
  optional: {},
  material: [],
};
const initialState: AdditionalTaskState = {
  WOMode: {
    isProjectTaskMode: false,
  },
  additionalTasks: [],
  currentAdditionalTask: {
    // additionalNumberId: 0,
    plane: { registrationNumber: "", type: "" },
    projectTaskID: "",
    status: "отложен",
    projectId: "",
    workStepReferencesLinks: [
      {
        type: "WO",
        reference: "",
        description: "",
      },
    ],
    resourcesRequests: [],
    material: [],
    actions: [],
    taskDescription: "",
    taskHeadLine: "",
    isDoubleInspectionRequired: false,
    currentActiveIndex: null,
    currentAction: {
      actionDescription: "",

      performedSing: "",

      doubleInspectedDate: "",
      doubleInspectedTime: "",
      inspectedDate: "",
      inspectedSing: "",
      performedName: "",
      inspectedName: "",
      doubleInspectedName: "",
      inspectedTime: "",
      doubleInspectionSing: "",
      isPartsRepareTask: false,
      isTrasferTask: false,
    },
  },
  isLoading: false,
  additionalTasksFetchError: null,
  countAdditionalByStatus: {
    completed: 0,
    postponed: 0,
    active: 0,
    closed: 0,
    all: 0,
  },
};

export const AdditionalTaskSlice = createSlice({
  name: "additionalTasks",
  initialState,
  reducers: {
    setMaterialForPrint: (state, action: PayloadAction<IMatPrintItem[]>) => {
      state.currentAdditionalTask.materialForPrint = action.payload;
    },
    setCurrentAdditionalTaskMaterialRequest: (
      state,
      action: PayloadAction<IMatData1>
    ) => {
      state.currentAdditionalTask.material = action.payload;
    },
    setCurrentAdditionalTaskMaterialRequestAplication: (
      state,
      action: PayloadAction<MatRequestAplication>
    ) => {
      state.currentAdditionalTask.currentMaterialReuestAplication =
        action.payload;
    },
    updateAdditionalTaskID: (state, action: PayloadAction<number>) => {
      state.currentAdditionalTask.additionalNumberId = action.payload;
    },
    setCurrentQrCodeLink: (state, action: PayloadAction<string>) => {
      state.currentAdditionalTask.QRCodeLink = action.payload;
    },
    setProjectTaskMode: (state, action: PayloadAction<boolean>) => {
      state.WOMode.isProjectTaskMode = action.payload;
    },
    setCurrentAdditionalTask: (state, action: PayloadAction<any>) => {
      state.currentAdditionalTask = action.payload;
    },
    addAdditionalTask: (state, action: PayloadAction<IAdditionalTask>) => {
      state.currentAdditionalTask = action.payload;
    },
    setOptional: (state, action: PayloadAction<any>) => {
      state.currentAdditionalTask.optional = action.payload;
    },
    setStatus: (state, action: PayloadAction<TStatus>) => {
      state.currentAdditionalTask.status = action.payload;
    },
    updatefinishDate: (state, action: PayloadAction<any>) => {
      state.currentAdditionalTask.finishDate = action.payload;
    },
    updateStartTime: (state, action: PayloadAction<any>) => {
      state.currentAdditionalTask.startDate = action.payload;
    },
    updateCreateTime: (state, action: PayloadAction<any>) => {
      state.currentAdditionalTask.createDate = action.payload;
    },
    updateWorkStepHeadLine: (state, action: PayloadAction<string>) => {
      state.currentAdditionalTask.taskHeadLine = action.payload;
    },
    updateWorkStepDescription: (state, action: PayloadAction<string>) => {
      state.currentAdditionalTask.taskDescription = action.payload;
    },
    updateDoubleWorkStatus: (state, action: PayloadAction<boolean>) => {
      state.currentAdditionalTask.isDoubleInspectionRequired = action.payload;
    },
    updateResourcesRequests: (
      state,
      action: PayloadAction<CheckboxValueType[]>
    ) => {
      state.currentAdditionalTask.resourcesRequests?.push(...action.payload);
    },
    updateMaintenanceType: (
      state,
      action: PayloadAction<NRCType | ScheduledType>
    ) => {
      state.currentAdditionalTask.taskType = action.payload;
    },

    setOptinal: (state, action: PayloadAction<any>) => {
      state.currentAdditionalTask.optional = action.payload;
    },
    addMaterials: (state, action: PayloadAction<IMatDataAdditional>) => {
      state.currentAdditionalTask?.material?.push(action.payload);
    },

    addAction: (state, action: PayloadAction<IActionType>) => {
      state.currentAdditionalTask.actions?.push(action.payload);
    },
    addDoubleInspectionRequired: (state, action: PayloadAction<boolean>) => {
      state.currentAdditionalTask.isDoubleInspectionRequired = action.payload;
    },

    setCurrentActionIndex: (state, action: PayloadAction<any>) => {
      state.currentAdditionalTask.currentActiveIndex = action.payload;
    },
    setCurrentAction: (state, action: PayloadAction<IActionType>) => {
      state.currentAdditionalTask.currentAction = action.payload;
    },
    updateAction(state, action: PayloadAction<IActiveActionProps>) {
      const { id, payload } = action.payload;
      state.currentAdditionalTask.actions[id] = payload;
    },
    updateActionCreateDate(
      state,
      action: PayloadAction<IActiveActionCreateDateProps>
    ) {
      const { id, payload } = action.payload;
      state.currentAdditionalTask.actions[id].createDate = payload;
    },
    // updateReferencesLinks: (
    //   state,
    //   action: PayloadAction<IReferencesLinkType>
    // ) => {
    //   state.currentAdditionalTask.workStepReferencesLinks.push(
    //     ...action.payload
    //   );
    // },
    setInitialTask: (state, action: PayloadAction<IAdditionalTask>) => {
      state.currentAdditionalTask = initialAdditionalTask;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllAdditionalTaskAplications.pending, (state) => {
        state.isLoading = true;
        state.additionalTasksFetchError = null;
      })
      .addCase(
        getAllAdditionalTaskAplications.fulfilled,
        (state, action: PayloadAction<MatRequestAplication[]>) => {
          state.isLoading = false;
          state.currentAdditionalTask.materialAplications = action.payload;
        }
      )
      .addCase(
        getAllAdditionalTaskAplications.rejected,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.additionalTasksFetchError = action.payload;
          console.error(action.payload);
        }
      )
      .addCase(updateAdditionalTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        updateAdditionalTask.fulfilled,
        (state, action: PayloadAction<IAdditionalTask>) => {
          state.isLoading = false;
          state.currentAdditionalTask = action.payload;
        }
      )
      .addCase(
        updateAdditionalTask.rejected,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.additionalTasksFetchError = action.payload;
          console.error(action.payload);
        }
      )
      .addCase(featchCountAdditionalByStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        featchCountAdditionalByStatus.fulfilled,
        (state, action: PayloadAction<ICountStatus>) => {
          state.isLoading = false;
          state.countAdditionalByStatus = action.payload;
        }
      )
      .addCase(
        featchCountAdditionalByStatus.rejected,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.additionalTasksFetchError = action.payload;
          console.error(action.payload);
        }
      )
      .addCase(createNRC.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        createNRC.fulfilled,
        (state, action: PayloadAction<IAdditionalTask>) => {
          state.isLoading = false;
          state.currentAdditionalTask = action.payload;
        }
      )
      .addCase(createNRC.rejected, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.additionalTasksFetchError = action.payload;
        console.error(action.payload);
      })
      .addCase(getAllAdditionalTaskMaterialsForStatistic.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        getAllAdditionalTaskMaterialsForStatistic.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.isLoading = false;
          state.currentAdditionalTask.taskPickSlipsMaterials = action.payload;
        }
      )
      .addCase(
        getAllAdditionalTaskMaterialsForStatistic.rejected,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.additionalTasksFetchError = action.payload;
          console.error(action.payload);
        }
      );
  },
});
export const {
  setProjectTaskMode,
  addAdditionalTask,
  setCurrentAdditionalTask,
  updateWorkStepHeadLine,
  updateWorkStepDescription,
  updateResourcesRequests,
  updateMaintenanceType,
  setOptinal,
  updatefinishDate,
  addMaterials,
  addAction,
  addDoubleInspectionRequired,
  setInitialTask,
  setStatus,
  setCurrentActionIndex,
  setCurrentAction,
  updateAction,
  setCurrentQrCodeLink,
  setCurrentAdditionalTaskMaterialRequestAplication,
  setCurrentAdditionalTaskMaterialRequest,
  setMaterialForPrint,
} = AdditionalTaskSlice.actions;
export default AdditionalTaskSlice.reducer;
