import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  IAreaDTO,
  IInspectionScopeDTO,
  IPanelDTO,
  ITaskType,
} from "@/types/TypesData";
import {
  getAllPanels,
  getAllTasks,
  getAllZones,
  getInspectionScope,
} from "@/utils/api/thunks";

type TaskState = {
  allTasks: ITaskType[];
  isLoading: boolean;
  allTasksFetchError: string | null;
  allPanels: IPanelDTO[];
  allZones: IAreaDTO[];
  inspectionScope: IInspectionScopeDTO[];
};

const initialState: TaskState = {
  isLoading: false,
  allTasks: [],
  allTasksFetchError: null,
  allPanels: [],
  allZones: [],
  inspectionScope: [],
};

export const tasksSlice = createSlice({
  name: "allTasks",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    // getAllTasks
    builder.addCase(getAllTasks.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getAllTasks.fulfilled,
      (state, action: PayloadAction<ITaskType[]>) => {
        state.isLoading = false;
        state.allTasks = action.payload;
      }
    );
    builder.addCase(
      getAllTasks.rejected,
      (state, action: PayloadAction<any>) => {
        state.allTasksFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false; // Ensure isLoading is set to false in case of rejection
      }
    );

    // getAllPanels
    builder.addCase(getAllPanels.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getAllPanels.fulfilled,
      (state, action: PayloadAction<IPanelDTO[]>) => {
        state.isLoading = false;
        state.allPanels = action.payload;
      }
    );
    builder.addCase(
      getAllPanels.rejected,
      (state, action: PayloadAction<any>) => {
        state.allTasksFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getAllZones
    builder.addCase(getAllZones.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getAllZones.fulfilled,
      (state, action: PayloadAction<IPanelDTO[]>) => {
        state.isLoading = false;
        state.allZones = action.payload;
      }
    );
    builder.addCase(
      getAllZones.rejected,
      (state, action: PayloadAction<any>) => {
        state.allTasksFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getInspectionScope
    builder.addCase(getInspectionScope.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getInspectionScope.fulfilled,
      (state, action: PayloadAction<IInspectionScopeDTO[]>) => {
        state.isLoading = false;
        state.inspectionScope = action.payload;
      }
    );
    builder.addCase(
      getInspectionScope.rejected,
      (state, action: PayloadAction<any>) => {
        state.allTasksFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // ... (other cases for other actions)
  },
});
// export const {} = tasksSlice.actions;

export default tasksSlice.reducer;
