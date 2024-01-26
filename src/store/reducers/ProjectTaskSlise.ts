import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  IAdditionalTask,
  IMatPrintItem,
  IReferencesLinkType,
} from "@/models/IAdditionalTask";
import { IProjectTask, IProjectTaskAll, TStatus } from "@/models/IProjectTask";

import {
  createProjectTask,
  featchFilteredTasksByProjectId,
  featchHardTimeProjectTasks,
  featchRoutineProjectTasks,
  updateProjectTask,
  featchFilteredNRCProject,
  featchFilteredNRCProjectTask,
  featchProjectTasksByProjectId,
  featchCountByStatus,
  createProjectTaskMaterialAplication,
  getAllProjectAplications,
  getAllProjectTaskAplications,
  fetchProjectTasks,
  getAllProjectTaskMaterialsForStatistic,
} from "@/utils/api/thunks";
import { IActionType } from "./AdditionalTaskSlice";
import {
  IInstData1,
  IMatData,
  IMatData1,
  IMatDataAdditional,
  IPanelDTO2,
  IPurchaseMaterial,
} from "@/types/TypesData";
import { IUser } from "@/models/IUser";
import { IProjectInfo } from "@/models/IProject";

type ProjectTaskState = {
  ProjectsTask: any[];
  NRC: any[];
  currentProjectTask: IProjectTaskAll;
  isLoading: boolean;
  NRCViewMode: boolean;
  ProjectTaskFetchError: string | null;
  countByStatus: ICountStatus;
};
export type ICountStatus = {
  completed: number;
  postponed: number;
  active: number;
  closed: number;
  all: number;
};
export type IActiveActionCreateDateProps = {
  id: number;
  payload: Date;
};
export type IActiveActionProps = {
  id: number;
  payload: IActionType;
};
export type ActiveMatRequestProps = {
  id: number;
  payload: IMatData1;
};
export type EditionActionType = {
  editedStoreMaterials: any[];
  purchaseStoreMaterials?: IPurchaseMaterial[];

  editedTime?: Date;
  sing?: string;
};
export type MatRequestAplication = {
  materials: IMatData1[] | IMatDataAdditional[] | [];
  // materials: any;
  editedAction: EditionActionType;
  createDate?: Date | null;
  completedDate?: Date;
  closedDate?: Date;
  userTelID?: string;
  user?: string;
  projectTaskId: any;
  projectTaskWO: number | null;
  taskNumber?: string;
  projectWO?: number | null;
  projectId: string;
  additionalTaskId?: number | null;
  userId?: any;
  planeType?: string;
  registrationNumber?: string;
  materialAplicationNumber?: number | null;
  _id?: string;
  id?: string;
  status?: TMaterialAplicationStatus;
  isPickSlipCreated?: boolean;
};
export type TMaterialAplicationStatus =
  | "отложена"
  | "в работе"
  | "собрана"
  | "закрыта"
  | "частично закрыта"
  | "частично собрана"
  | "в закупку"
  | "расходное требование создано";
export interface IMatRequestAplication {
  materials?: IMatData1[];
  createDate?: Date | null;
  completedDate?: Date;
  user?: string;
  projectTaskId?: IProjectTaskAll;
  projectTaskWO?: number | null;
  taskNumber?: string;
  projectWO?: number | null;
  projectId?: IProjectInfo;
  userId?: IUser;
  planeType?: string;
  registrationNumber?: string;
  materialAplicationNumber?: number | null;
  _id?: string;
  id?: string;
  status?: TMaterialAplicationStatus;
  isPickSlipCreated?: boolean;
}

const initialState: ProjectTaskState = {
  ProjectsTask: [],
  currentProjectTask: {
    _id: "",
    projectId: "",
    ownerId: "",
    taskId: { ammtossArr: [], accessArr: [], ammtossArrNew: [] },
    optional: {},
    status: "отложен",
    projectTaskNRSs: [],
    workStepReferencesLinks: [],
    actions: [],
    currentActiveIndex: null,
    materialReuest: [],
    materialReuestAplications: [
      {
        materialAplicationNumber: null,
        createDate: new Date(),
        materials: [],
        projectId: "",
        projectTaskId: "",
        projectTaskWO: null,
        projectWO: null,
        user: "",
        editedAction: {
          editedStoreMaterials: [],
          purchaseStoreMaterials: [],
          sing: "",
        },
      },
    ],
    currentAction: {
      actionDescription: "",
      performedDate: "",
      performedSing: "",
      performedTime: "",
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
    newMaterial: [],
  },
  isLoading: false,
  ProjectTaskFetchError: null,
  NRC: [],
  NRCViewMode: false,
  countByStatus: {
    completed: 0,
    postponed: 0,
    active: 0,
    closed: 0,
    all: 0,
  },
};

export const projectTaskSlice = createSlice({
  name: "projectTasks",
  initialState,
  reducers: {
    setMaterialForPrint: (state, action: PayloadAction<IMatPrintItem[]>) => {
      state.currentProjectTask.materialForPrint = action.payload;
    },
    setCurrentQrCodeLink: (state, action: PayloadAction<string>) => {
      state.currentProjectTask.QRCodeLink = action.payload;
    },
    setCurrentProjectTask: (state, action: PayloadAction<IProjectTaskAll>) => {
      state.currentProjectTask = action.payload;
    },
    addProjectTask: (state, action: PayloadAction<IProjectTask>) => {
      state.ProjectsTask.push(action.payload);
    },

    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setIsActive: (state, action: PayloadAction<TStatus>) => {
      state.currentProjectTask.status = "в работе";
    },
    setStatus: (state, action: PayloadAction<TStatus>) => {
      state.currentProjectTask.status = action.payload;
    },
    updatefinishDate: (state, action: PayloadAction<any>) => {
      state.currentProjectTask.finishDate = action.payload;
    },
    updateStartTime: (state, action: PayloadAction<any>) => {
      state.currentProjectTask.startDate = action.payload;
    },
    setOptional: (state, action: PayloadAction<any>) => {
      state.currentProjectTask.optional = action.payload;
    },
    addAction: (state, action: PayloadAction<IActionType>) => {
      state.currentProjectTask.actions?.push(action.payload);
    },
    setViewMode: (state, action: PayloadAction<boolean>) => {
      state.NRCViewMode = action.payload;
    },
    setCurrentActionIndex: (state, action: PayloadAction<any>) => {
      state.currentProjectTask.currentActiveIndex = action.payload;
    },
    // setCurrentAction: (state, action: PayloadAction<any>) => {
    //   state.currentProjectTask.currentAction = action.payload;
    // },
    updateAction(state, action: PayloadAction<IActiveActionProps>) {
      const { id, payload } = action.payload;
      state.currentProjectTask.actions[id] = payload;
    },
    updateActionCreateDate(
      state,
      action: PayloadAction<IActiveActionCreateDateProps>
    ) {
      const { id, payload } = action.payload;
      state.currentProjectTask.actions[id].createDate = payload;
    },
    // setCurrentProjectTaskMaterial:(state, action: <PayloadAction<IMatData[]>)=> {

    //   state.currentProjectTask.material=action.payload
    // }
    setCurrentProjectTaskMaterial: (
      state,
      action: PayloadAction<IMatData1[]>
    ) => {
      state.currentProjectTask.material = action.payload;
    },
    setCurrentProjectTaskMaterialRequest: (
      state,
      action: PayloadAction<IMatData1[]>
    ) => {
      state.currentProjectTask.materialReuest = action.payload;
    },
    setCurrentProjectTaskNewMaterial: (
      state,
      action: PayloadAction<IMatData1[]>
    ) => {
      state.currentProjectTask.newMaterial = action.payload;
    },
    setCurrentProjectTaskMaterialRequestAplication: (
      state,
      action: PayloadAction<MatRequestAplication>
    ) => {
      state.currentProjectTask.currentMaterialReuestAplication = action.payload;
    },
    updateCurrentProjectTaskMaterialRequest: (
      state,
      action: PayloadAction<ActiveMatRequestProps>
    ) => {
      const { id, payload } = action.payload;
      state.currentProjectTask.materialReuest[id] = payload;
    },
    updateCurrentProjectTaskNewMaterial: (
      state,
      action: PayloadAction<ActiveMatRequestProps>
    ) => {
      const { id, payload } = action.payload;
      state.currentProjectTask.newMaterial[id] = payload;
    },
    setCurrentProjectTaskInstrument: (
      state,
      action: PayloadAction<IInstData1[]>
    ) => {
      state.currentProjectTask.instrument = action.payload;
    },
    addworkStepReferencesLinks: (
      state,
      action: PayloadAction<IReferencesLinkType>
    ) => {
      state.currentProjectTask.workStepReferencesLinks?.push(action.payload);
    },

    setProjectTaskPanels: (state, action: PayloadAction<any[]>) => {
      state.currentProjectTask.currentPanels = action.payload;
    },
    setProjectTaskNotIncludePanels: (state, action: PayloadAction<any[]>) => {
      state.currentProjectTask.currentNotIncludePanels = action.payload;
    },
    setProjectTaskZones: (state, action: PayloadAction<any[]>) => {
      state.currentProjectTask.currentZones = action.payload;
    },
    setProjectTaskInspectionScope: (state, action: PayloadAction<any[]>) => {
      state.currentProjectTask.inspectionScope = action.payload;
    },

    addProjecttaskMaterialRequest: (
      state,
      action: PayloadAction<MatRequestAplication>
    ) => {
      state.currentProjectTask.materialReuestAplications?.push(action.payload);
    },
    setInitialProjecttaskMaterialRequest: (
      state,
      action: PayloadAction<any>
    ) => {
      state.currentProjectTask.materialReuestAplications = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchProjectTasks
    builder.addCase(fetchProjectTasks.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      fetchProjectTasks.fulfilled,
      (state, action: PayloadAction<IProjectTaskAll[]>) => {
        state.isLoading = false;
        state.ProjectsTask = action.payload;
      }
    );
    builder.addCase(
      fetchProjectTasks.rejected,
      (state, action: PayloadAction<any>) => {
        state.ProjectTaskFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // createProjectTask
    builder.addCase(createProjectTask.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      createProjectTask.fulfilled,
      (state, action: PayloadAction<IProjectTaskAll>) => {
        state.isLoading = false;
        state.ProjectsTask.push(action.payload);
      }
    );
    builder.addCase(
      createProjectTask.rejected,
      (state, action: PayloadAction<any>) => {
        state.ProjectTaskFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // featchFilteredTasksByProjectId
    builder.addCase(featchFilteredTasksByProjectId.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      featchFilteredTasksByProjectId.fulfilled,
      (state, action: PayloadAction<IProjectTaskAll[]>) => {
        state.isLoading = false;
        state.ProjectsTask = action.payload;
      }
    );
    builder.addCase(
      featchFilteredTasksByProjectId.rejected,
      (state, action: PayloadAction<any>) => {
        state.ProjectTaskFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // featchRoutineProjectTasks
    builder.addCase(featchRoutineProjectTasks.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      featchRoutineProjectTasks.fulfilled,
      (state, action: PayloadAction<IProjectTaskAll[]>) => {
        state.isLoading = false;
        state.ProjectsTask = action.payload;
      }
    );
    builder.addCase(
      featchRoutineProjectTasks.rejected,
      (state, action: PayloadAction<any>) => {
        state.ProjectTaskFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // featchHardTimeProjectTasks
    builder.addCase(featchHardTimeProjectTasks.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      featchHardTimeProjectTasks.fulfilled,
      (state, action: PayloadAction<IProjectTaskAll[]>) => {
        state.isLoading = false;
        state.ProjectsTask = action.payload;
      }
    );
    builder.addCase(
      featchHardTimeProjectTasks.rejected,
      (state, action: PayloadAction<any>) => {
        state.ProjectTaskFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // featchFilteredNRCProject
    builder.addCase(featchFilteredNRCProject.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      featchFilteredNRCProject.fulfilled,
      (state, action: PayloadAction<IAdditionalTask[]>) => {
        state.isLoading = false;
        state.NRC = action.payload;
      }
    );
    builder.addCase(
      featchFilteredNRCProject.rejected,
      (state, action: PayloadAction<any>) => {
        state.ProjectTaskFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // featchFilteredNRCProjectTask
    builder.addCase(featchFilteredNRCProjectTask.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      featchFilteredNRCProjectTask.fulfilled,
      (state, action: PayloadAction<IAdditionalTask[]>) => {
        state.isLoading = false;
        state.currentProjectTask.projectTaskNRSs = action.payload;
      }
    );
    builder.addCase(
      featchFilteredNRCProjectTask.rejected,
      (state, action: PayloadAction<any>) => {
        state.ProjectTaskFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // featchProjectTasksByProjectId
    builder.addCase(featchProjectTasksByProjectId.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      featchProjectTasksByProjectId.fulfilled,
      (state, action: PayloadAction<IProjectTaskAll>) => {
        state.isLoading = false;
        state.currentProjectTask = action.payload;
      }
    );
    builder.addCase(
      featchProjectTasksByProjectId.rejected,
      (state, action: PayloadAction<any>) => {
        state.ProjectTaskFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );
    // featchCountByStatus
    builder.addCase(featchCountByStatus.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      featchCountByStatus.fulfilled,
      (state, action: PayloadAction<ICountStatus>) => {
        state.isLoading = false;
        state.countByStatus = action.payload;
      }
    );
    builder.addCase(
      featchCountByStatus.rejected,
      (state, action: PayloadAction<any>) => {
        state.ProjectTaskFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getAllProjectTaskAplications
    builder.addCase(getAllProjectTaskAplications.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getAllProjectTaskAplications.fulfilled,
      (state, action: PayloadAction<MatRequestAplication[]>) => {
        state.isLoading = false;
        state.currentProjectTask.materialReuestAplications = action.payload;
      }
    );
    builder.addCase(
      getAllProjectTaskAplications.rejected,
      (state, action: PayloadAction<any>) => {
        state.ProjectTaskFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getAllProjectTaskMaterialsForStatistic
    builder.addCase(getAllProjectTaskMaterialsForStatistic.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getAllProjectTaskMaterialsForStatistic.fulfilled,
      (state, action: PayloadAction<any[]>) => {
        state.isLoading = false;
        state.currentProjectTask.taskPickSlipsMaterials = action.payload;
      }
    );
    builder.addCase(
      getAllProjectTaskMaterialsForStatistic.rejected,
      (state, action: PayloadAction<any>) => {
        state.ProjectTaskFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // If you uncommented the updateProjectTask cases, you would add them here
    // ...
  },
});

export const {
  addProjectTask,
  setViewMode,
  setCurrentProjectTask,
  setIsLoading,
  setIsActive,
  setStatus,
  setOptional,
  updateStartTime,
  updatefinishDate,
  addAction,
  // setCurrentAction,
  setCurrentActionIndex,
  updateAction,
  updateActionCreateDate,
  setCurrentProjectTaskMaterial,
  setCurrentProjectTaskInstrument,
  setCurrentQrCodeLink,
  addworkStepReferencesLinks,
  setProjectTaskPanels,
  setProjectTaskZones,
  setProjectTaskNotIncludePanels,
  setProjectTaskInspectionScope,
  setCurrentProjectTaskMaterialRequest,
  updateCurrentProjectTaskMaterialRequest,
  addProjecttaskMaterialRequest,
  setInitialProjecttaskMaterialRequest,
  setCurrentProjectTaskMaterialRequestAplication,
  setCurrentProjectTaskNewMaterial,
  updateCurrentProjectTaskNewMaterial,
  setMaterialForPrint,
} = projectTaskSlice.actions;

export default projectTaskSlice.reducer;
