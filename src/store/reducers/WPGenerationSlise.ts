import { ITaskDTO } from "@/components/mantainance/base/workPackage/packageAplications/AddAplicationForm";
import { IAplicationInfo } from "@/types/TypesData";

import {
  getFilteredRequirements,
  createRequirement,
  updateProject,
  getFilteredProjects,
  findInstrumentsByTaskNumbers,
  findMaterialsByTaskNumbers,
  findTasksAndCalculateTotalTime,
  updateProjectAplicationByID,
  getAplicationByID,
  getFilteredAplications,
  createNewAplications,
} from "@/utils/api/thunks";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AplicationResponce = {
  _id?: any;
  aplicationName: string;
  serviceType?: string;
  planeNumber?: string;
  planeType?: string;
  companyID: string;
  companyName?: string;
  dateOfAplication?: any;
  tasks?: ITaskDTO[] | [];
  isCreatedProject?: boolean;
  ownerId?: string;
  projectId?: string;
  projectWO?: number;
};

type WPGenerationSlise = {
  filteredAplications: any;
  filteredProjects: any;
  isLoading: boolean;
  filteredProjectRequirements: any[] | null;
  aplicationsFetchError: string | null;
};

const initialState: WPGenerationSlise = {
  filteredAplications: [],
  filteredProjects: [],
  isLoading: false,
  aplicationsFetchError: null,
  filteredProjectRequirements: [],
};

export const aplicationSlice = createSlice({
  name: "planning",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    // getFilteredRequirements
    builder.addCase(getFilteredRequirements.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredRequirements.fulfilled,
      (state, action: PayloadAction<any[] | []>) => {
        state.isLoading = false;
        // Handle the fulfilled action as needed
      }
    );
    builder.addCase(
      getFilteredRequirements.rejected,
      (state, action: PayloadAction<any>) => {
        state.aplicationsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // createRequirement
    builder.addCase(createRequirement.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      createRequirement.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        // Handle the fulfilled action as needed
      }
    );
    builder.addCase(
      createRequirement.rejected,
      (state, action: PayloadAction<any>) => {
        state.aplicationsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // updateProject
    builder.addCase(updateProject.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      updateProject.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        // Handle the fulfilled action as needed
      }
    );
    builder.addCase(
      updateProject.rejected,
      (state, action: PayloadAction<any>) => {
        state.aplicationsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getFilteredProjects
    builder.addCase(getFilteredProjects.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredProjects.fulfilled,
      (state, action: PayloadAction<any[] | []>) => {
        state.isLoading = false;
        state.filteredProjects = action.payload || [];
      }
    );
    builder.addCase(
      getFilteredProjects.rejected,
      (state, action: PayloadAction<any>) => {
        state.aplicationsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );
    // findInstrumentsByTaskNumbers
    builder.addCase(findInstrumentsByTaskNumbers.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      findInstrumentsByTaskNumbers.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        // Handle the fulfilled action as needed
      }
    );
    builder.addCase(
      findInstrumentsByTaskNumbers.rejected,
      (state, action: PayloadAction<any>) => {
        state.aplicationsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // findMaterialsByTaskNumbers
    builder.addCase(findMaterialsByTaskNumbers.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      findMaterialsByTaskNumbers.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        // Handle the fulfilled action as needed
      }
    );
    builder.addCase(
      findMaterialsByTaskNumbers.rejected,
      (state, action: PayloadAction<any>) => {
        state.aplicationsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // findTasksAndCalculateTotalTime
    builder.addCase(findTasksAndCalculateTotalTime.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      findTasksAndCalculateTotalTime.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        // Handle the fulfilled action as needed
      }
    );
    builder.addCase(
      findTasksAndCalculateTotalTime.rejected,
      (state, action: PayloadAction<any>) => {
        state.aplicationsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // updateProjectAplicationByID
    builder.addCase(updateProjectAplicationByID.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      updateProjectAplicationByID.fulfilled,
      (state, action: PayloadAction<AplicationResponce>) => {
        state.isLoading = false;
        // Handle the fulfilled action as needed
      }
    );
    builder.addCase(
      updateProjectAplicationByID.rejected,
      (state, action: PayloadAction<any>) => {
        state.aplicationsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getAplicationByID
    builder.addCase(getAplicationByID.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getAplicationByID.fulfilled,
      (state, action: PayloadAction<AplicationResponce>) => {
        state.isLoading = false;
        // Handle the fulfilled action as needed
      }
    );
    builder.addCase(
      getAplicationByID.rejected,
      (state, action: PayloadAction<any>) => {
        state.aplicationsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getFilteredAplications
    builder.addCase(getFilteredAplications.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredAplications.fulfilled,
      (state, action: PayloadAction<AplicationResponce[]>) => {
        state.isLoading = false;
        state.filteredAplications = action.payload;
      }
    );
    builder.addCase(
      getFilteredAplications.rejected,
      (state, action: PayloadAction<any>) => {
        state.aplicationsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // createNewAplications
    builder.addCase(createNewAplications.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      createNewAplications.fulfilled,
      (state, action: PayloadAction<IAplicationInfo>) => {
        state.isLoading = false;
        state.filteredAplications.push(action.payload);
      }
    );
    builder.addCase(
      createNewAplications.rejected,
      (state, action: PayloadAction<any>) => {
        state.aplicationsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // ... (other cases for other actions)
  },
});
export const {} = aplicationSlice.actions;

export default aplicationSlice.reducer;
