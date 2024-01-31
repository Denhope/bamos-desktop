import {
  IActionType,
  IAdditionalTaskMTBCreate,
} from '@/models/IAdditionalTaskMTB';
import { IProjectResponce } from '@/models/IProject';
import { IProjectTask } from '@/models/IProjectTaskMTB';
import {
  ICreateProjectGroup,
  createNRCMTB,
  createProjectGroup,
  deleteGroupsByIds,
  getFilteredAditionalTask,
  getFilteredAditionalTasks,
  getFilteredGroups,
  getFilteredGroupsTasks,
  getFilteredProjectTasks,
  getFilteredProjects,
  getFilteredRemoverdItems,
  getFilteredRequirements,
  updateAdditionalTask,
  updateGroupByID,
  updateProjectAdditionalTasksByIds,
  updateProjectTask,
  updateProjectTaskActions,
  updateProjectTasksByIds,
} from '@/utils/api/thunks';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type MTBState = {
  projects: any[] | [];
  projectGroups: any[];
  currentProject?: IProjectResponce | null;
  currentProjectTask: IProjectTask | null;
  isLoading: boolean;
  isLoadingReq: boolean;
  isLoadingWO: boolean;
  planesFetchError: string | null;
  projectTasks: any[];
  projectAdditionalTasks: any[];
  projectFilteredRemoverdItems: any[];
  currentProjectAdditionalTask: IAdditionalTaskMTBCreate | null;
  currentAction: IActionType | null;
  currentAdditionalAction: any | null;
  currentActiveIndex: any;
  currentActiveAdditionalIndex: any;
};

const initialState: MTBState = {
  isLoading: false,
  planesFetchError: null,
  projects: [],
  projectAdditionalTasks: [],
  currentProject: null,
  projectTasks: [],
  currentProjectTask: null,
  currentAction: null,
  currentAdditionalAction: null,
  currentActiveIndex: null,
  currentProjectAdditionalTask: null,
  projectGroups: [],
  currentActiveAdditionalIndex: null,
  projectFilteredRemoverdItems: [],
  isLoadingReq: false,
  isLoadingWO: false,
};
export type IActiveActionProps = {
  id: number;
  payload: IActionType | null;
};

export const PlaneSlice = createSlice({
  name: 'projectTasks/mtb',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<IProjectResponce>) => {
      state.currentProject = action.payload;
    },
    setNullProjectTasks: (state, action: PayloadAction<[]>) => {
      state.projectTasks = action.payload;
    },

    setCurrentProjectTask: (
      state,
      action: PayloadAction<IProjectTask | null>
    ) => {
      state.currentProjectTask = action.payload;
    },

    setCurrentAction: (state, action: PayloadAction<IActionType | null>) => {
      state.currentAction = action.payload;
    },
    updateAction(state, action: PayloadAction<IActiveActionProps>) {
      const { id, payload } = action.payload;
      const defaultPayload = {}; // replace {} with the default value you want to use
      if (state.currentProjectTask && state.currentProjectTask.actions) {
        state.currentProjectTask.actions[id] = payload ?? defaultPayload;
      }
    },

    setCurrentActionIndexMtb: (state, action: PayloadAction<any>) => {
      state.currentActiveIndex = action.payload;
    },
    addAction: (state, action: PayloadAction<IActionType>) => {
      state.currentProjectTask &&
        state.currentProjectTask.actions?.push(action.payload);
    },
    setUpdatedProjectTask: (
      state,
      action: PayloadAction<{ index: number; task: IProjectResponce }>
    ) => {
      state.projectTasks[action.payload.index] = action.payload.task;
    },
    ///nrc
    setCurrentProjectAdditionalTask: (
      state,
      action: PayloadAction<IAdditionalTaskMTBCreate | null>
    ) => {
      state.currentProjectAdditionalTask = action.payload;
    },
    setNullAdditionalTasks: (state, action: PayloadAction<[]>) => {
      state.projectAdditionalTasks = action.payload;
    },
    setUpdatedProjectAdditionalTask: (
      state,
      action: PayloadAction<{ index: number; task: any }>
    ) => {
      state.projectAdditionalTasks[action.payload.index] = action.payload.task;
    },
    addAdditionalAction: (state, action: PayloadAction<IActionType>) => {
      state.currentProjectAdditionalTask &&
        state.currentProjectAdditionalTask.actions?.push(action.payload);
    },
    setCurrentAdditionalActionIndexMtb: (state, action: PayloadAction<any>) => {
      state.currentActiveAdditionalIndex = action.payload;
    },
    setCurrentAdditionalAction: (
      state,
      action: PayloadAction<IActionType | null>
    ) => {
      state.currentAdditionalAction = action.payload;
    },
    updateAdditionalAction(state, action: PayloadAction<IActiveActionProps>) {
      const { id, payload } = action.payload;
      const defaultPayload = {}; // replace {} with the default value you want to use
      if (
        state.currentProjectAdditionalTask &&
        state.currentProjectAdditionalTask.actions
      ) {
        state.currentProjectAdditionalTask.actions[id] =
          payload ?? defaultPayload;
      }
    },
    setCurrentQrCodeLink: (state, action: PayloadAction<any>) => {
      if (state.currentProjectTask) {
        state.currentProjectTask.QRCodeLink = action.payload;
      }
    },
    setCurrentQrCodeLinkAdd: (state, action: PayloadAction<any>) => {
      if (state.currentProjectAdditionalTask) {
        state.currentProjectAdditionalTask.QRCodeLink = action.payload;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(updateProjectAdditionalTasksByIds.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        updateProjectAdditionalTasksByIds.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
          // Handle the fulfilled action as needed
        }
      )
      .addCase(updateProjectAdditionalTasksByIds.rejected, (state, action) => {
        state.isLoading = false;
        state.planesFetchError = action.error.message || 'An error occurred';
        console.error(action.error);
      })
      .addCase(updateAdditionalTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        updateAdditionalTask.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
          const index = state.projectAdditionalTasks.findIndex(
            (task) => task._id === action.payload.id
          );
          state.currentProjectAdditionalTask = action.payload;
          if (index !== -1) {
            state.projectAdditionalTasks[index] = action.payload;
          }
        }
      )
      .addCase(updateAdditionalTask.rejected, (state, action) => {
        state.isLoading = false;
        state.planesFetchError = action.error.message || 'An error occurred';
        console.error(action.error);
      })
      // ... (other cases for updateGroupByID, deleteGroupsByIds, getFilteredGroupsTasks, getFilteredRemoverdItems, getFilteredGroups, createProjectGroup, updateProjectTasksByIds, and getFilteredAditionalTasks)
      .addCase(getFilteredAditionalTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        getFilteredAditionalTasks.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
          // Handle the fulfilled action as needed
        }
      )
      .addCase(getFilteredAditionalTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.planesFetchError = action.error.message || 'An error occurred';
        console.error(action.error);
      });

    // getFilteredProjects
    builder.addCase(getFilteredProjects.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredProjects.fulfilled,
      (state, action: PayloadAction<any[] | []>) => {
        state.isLoading = false;
        state.projects = action.payload || [];
      }
    );
    builder.addCase(
      getFilteredProjects.rejected,
      (state, action: PayloadAction<any>) => {
        state.planesFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );
  },
});

export const {
  setCurrentProjectTask,

  setCurrentProject,
  setCurrentAction,
  setCurrentActionIndexMtb,
  updateAction,
  addAction,
  setNullProjectTasks,
  setUpdatedProjectTask,
  setCurrentProjectAdditionalTask,
  setNullAdditionalTasks,
  setUpdatedProjectAdditionalTask,
  addAdditionalAction,
  setCurrentAdditionalAction,
  setCurrentAdditionalActionIndexMtb,
  updateAdditionalAction,
  setCurrentQrCodeLink,
  setCurrentQrCodeLinkAdd,
} = PlaneSlice.actions;
export default PlaneSlice.reducer;
