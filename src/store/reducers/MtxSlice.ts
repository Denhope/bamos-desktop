// @ts-nocheck
import { IPlane } from "@/models/IPlane";
import { IPlaneWO } from "@/models/IPlaneWO";
import { IPlaneTaskResponce, IPlaneTask } from "@/models/ITask";
import {
  getFilteredPlanesWO,
  editPlaneWO,
  createNewPlaneWO,
  getPlaneByID,
  getAllPlanes,
  getFilteredPlanesTasks,
  getFilteredPlanesTasksForUpdate,
  getFilteredPlanesTasksForDue,
  getFilteredPlanesTasksForDueUpdate,
  getFilteredPlanesTasksForWO,
} from "@/utils/api/thunks";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type PickSlipState = {
  planes: IPlane[];
  planesTasks: IPlaneTaskResponce[];
  currentPlane?: IPlane;
  planesWO: IPlaneWO[];
  isLoading: boolean;
  planesFetchError: string | null;
  dueTasks: IPlaneTaskResponce[];
};

const initialState: PickSlipState = {
  isLoading: false,
  planesFetchError: null,
  planes: [],
  planesTasks: [],
  planesWO: [],
  dueTasks: [],
};

export const PlaneSlice = createSlice({
  name: "projectTasks",
  initialState,
  reducers: {
    setCurrentPlane: (state, action: PayloadAction<IPlane>) => {
      state.currentPlane = action.payload;
    },
    setPlaneTasks: (state, action: PayloadAction<IPlaneTask[]>) => {
      state.planesTasks = action.payload;
    },
  },

  extraReducers: (builder) => {
    // getFilteredPlanesWO
    builder.addCase(getFilteredPlanesWO.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredPlanesWO.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.planesWO = action.payload;
      }
    );
    builder.addCase(
      getFilteredPlanesWO.rejected,
      (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.planesFetchError = action.payload;
        console.error(action.payload);
      }
    );

    // editPlaneWO
    builder.addCase(editPlaneWO.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      editPlaneWO.fulfilled,
      (state, action: PayloadAction<IPlaneWO>) => {
        state.isLoading = false;
        // Update the specific planeWO in the state if needed
      }
    );
    builder.addCase(
      editPlaneWO.rejected,
      (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.planesFetchError = action.payload;
        console.error(action.payload);
      }
    );

    // createNewPlaneWO
    builder.addCase(createNewPlaneWO.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      createNewPlaneWO.fulfilled,
      (state, action: PayloadAction<IPlaneWO>) => {
        state.isLoading = false;
        state.planesWO.push(action.payload);
      }
    );
    builder.addCase(
      createNewPlaneWO.rejected,
      (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.planesFetchError = action.payload;
        console.error(action.payload);
      }
    );

    // getPlaneByID
    builder.addCase(getPlaneByID.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getPlaneByID.fulfilled,
      (state, action: PayloadAction<IPlane>) => {
        state.isLoading = false;
        state.currentPlane = action.payload;
      }
    );
    builder.addCase(
      getPlaneByID.rejected,
      (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.planesFetchError = action.payload;
        console.error(action.payload);
      }
    );

    // getAllPlanes
    builder.addCase(getAllPlanes.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getAllPlanes.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.planes = action.payload;
      }
    );
    builder.addCase(
      getAllPlanes.rejected,
      (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.planesFetchError = action.payload;
        console.error(action.payload);
      }
    );

    // getFilteredPlanesTasks
    builder.addCase(getFilteredPlanesTasks.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredPlanesTasks.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.planesTasks = action.payload;
      }
    );
    builder.addCase(
      getFilteredPlanesTasks.rejected,
      (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.planesFetchError = action.payload;
        console.error(action.payload);
      }
    );

    // getFilteredPlanesTasksForUpdate
    builder.addCase(getFilteredPlanesTasksForUpdate.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredPlanesTasksForUpdate.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.planesTasks = action.payload;
      }
    );
    builder.addCase(
      getFilteredPlanesTasksForUpdate.rejected,
      (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.planesFetchError = action.payload;
        console.error(action.payload);
      }
    );

    // getFilteredPlanesTasksForDue
    builder.addCase(getFilteredPlanesTasksForDue.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredPlanesTasksForDue.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.dueTasks = action.payload;
      }
    );
    builder.addCase(
      getFilteredPlanesTasksForDue.rejected,
      (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.planesFetchError = action.payload;
        console.error(action.payload);
      }
    );

    // getFilteredPlanesTasksForDueUpdate
    builder.addCase(getFilteredPlanesTasksForDueUpdate.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredPlanesTasksForDueUpdate.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.dueTasks = action.payload;
      }
    );
    builder.addCase(
      getFilteredPlanesTasksForDueUpdate.rejected,
      (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.planesFetchError = action.payload;
        console.error(action.payload);
      }
    );

    // getFilteredPlanesTasksForWO
    builder.addCase(getFilteredPlanesTasksForWO.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredPlanesTasksForWO.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        // Handle the fulfilled action as needed
      }
    );
    builder.addCase(
      getFilteredPlanesTasksForWO.rejected,
      (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.planesFetchError = action.payload;
        console.error(action.payload);
      }
    );
  },
});

export const { setCurrentPlane, setPlaneTasks } = PlaneSlice.actions;
export default PlaneSlice.reducer;
