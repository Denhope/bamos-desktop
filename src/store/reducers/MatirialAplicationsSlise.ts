import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  EditionActionType,
  MatRequestAplication,
  TMaterialAplicationStatus,
} from "./ProjectTaskSlise";
import {
  createProjectTaskMaterialAplication,
  getAllMaterialAplication,
  getAplicationById,
  getCountAllprojectsAplications,
  updateAplicationById,
} from "@/utils/api/thunks";

import { IMaterialStoreRequestItem } from "@/models/IMaterialStoreItem";

type MaterialAplicationsState = {
  materialsAplications: MatRequestAplication[];
  allMaterialAplicationsCount: {
    postponed: number;
  };
  currentMaterialsAplication: MatRequestAplication;
  isLoading: boolean;
  allMaterialFetchError: string | null;
};

const initialState: MaterialAplicationsState = {
  isLoading: false,

  allMaterialFetchError: null,
  materialsAplications: [],
  currentMaterialsAplication: {
    projectId: "",
    projectTaskId: "",
    projectTaskWO: null,
    editedAction: {
      editedStoreMaterials: [],
      purchaseStoreMaterials: [],
      sing: "",
    },
    materials: [],
  },
  allMaterialAplicationsCount: { postponed: 0 },
};
export type IActiveMaterialProps = {
  id: number;
  payload: any;
};

export const MaterialAplicationSlice = createSlice({
  name: "projectTasks",
  initialState,
  reducers: {
    setAddedMaterial(state, action: PayloadAction<IActiveMaterialProps>) {
      const { id, payload } = action.payload;
      state.currentMaterialsAplication.materials[id] = payload;
    },
    setOnPurchaseMaterial(state, action: PayloadAction<IActiveMaterialProps>) {
      const { id, payload } = action.payload;
      state.currentMaterialsAplication.materials[id] = payload;
    },

    setEditedMaterialAplication: (
      state,
      action: PayloadAction<EditionActionType>
    ) => {
      state.currentMaterialsAplication.editedAction = action.payload;
    },
    setCurrentMaterialAplication: (state, action: PayloadAction<any>) => {
      state.currentMaterialsAplication = action.payload;
    },
    setEditedMaterialAplicationMaterials: (
      state,
      action: PayloadAction<any>
    ) => {
      state.currentMaterialsAplication.materials = action.payload;
    },

    addPurchaseMaterialAplicationMaterials: (
      state,
      action: PayloadAction<any>
    ) => {
      state.currentMaterialsAplication.editedAction?.purchaseStoreMaterials?.push(
        action.payload
      );
    },
    setCurrentMaterialAplicationStatus: (
      state,
      action: PayloadAction<TMaterialAplicationStatus>
    ) => {
      state.currentMaterialsAplication.status = action.payload;
    },
    addEditedMaterial: (
      state,
      action: PayloadAction<IMaterialStoreRequestItem>
    ) => {
      state.currentMaterialsAplication?.editedAction?.editedStoreMaterials.push(
        action.payload
      );
    },
    // addPurchaseMaterial: (state, action: PayloadAction<IMatData1>) => {
    //   state.currentMaterialsAplication?.editedAction?.editedStoreMaterials.push(
    //     action.payload
    //   );
    // },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProjectTaskMaterialAplication.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        createProjectTaskMaterialAplication.fulfilled,
        (state, action: PayloadAction<MatRequestAplication>) => {
          state.isLoading = false;
          state.materialsAplications.push(action.payload);
        }
      )
      .addCase(
        createProjectTaskMaterialAplication.rejected,
        (state, action) => {
          state.isLoading = false;
          state.allMaterialFetchError =
            action.error.message || "An error occurred";
          console.error(action.error);
        }
      )
      .addCase(getAplicationById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        getAplicationById.fulfilled,
        (state, action: PayloadAction<MatRequestAplication>) => {
          state.isLoading = false;
          state.currentMaterialsAplication = action.payload;
        }
      )
      .addCase(getAplicationById.rejected, (state, action) => {
        state.isLoading = false;
        state.allMaterialFetchError =
          action.error.message || "An error occurred";
        console.error(action.error);
      })
      .addCase(getAllMaterialAplication.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        getAllMaterialAplication.fulfilled,
        (state, action: PayloadAction<MatRequestAplication[]>) => {
          state.isLoading = false;
          state.materialsAplications = action.payload;
        }
      )
      .addCase(getAllMaterialAplication.rejected, (state, action) => {
        state.isLoading = false;
        state.allMaterialFetchError =
          action.error.message || "An error occurred";
        console.error(action.error);
      })
      .addCase(updateAplicationById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        updateAplicationById.fulfilled,
        (state, action: PayloadAction<MatRequestAplication>) => {
          state.isLoading = false;
          state.currentMaterialsAplication = action.payload;
        }
      )
      .addCase(updateAplicationById.rejected, (state, action) => {
        state.isLoading = false;
        state.allMaterialFetchError =
          action.error.message || "An error occurred";
        console.error(action.error);
      })
      .addCase(getCountAllprojectsAplications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        getCountAllprojectsAplications.fulfilled,
        (state, action: PayloadAction<{ postponed: number }>) => {
          state.isLoading = false;
          state.allMaterialAplicationsCount = action.payload;
        }
      )
      .addCase(getCountAllprojectsAplications.rejected, (state, action) => {
        state.isLoading = false;
        state.allMaterialFetchError =
          action.error.message || "An error occurred";
        console.error(action.error);
      });
  },
});
export const {
  setCurrentMaterialAplication,
  setCurrentMaterialAplicationStatus,
  setEditedMaterialAplicationMaterials,
  setEditedMaterialAplication,
  setOnPurchaseMaterial,
  addEditedMaterial,
  setAddedMaterial,
  addPurchaseMaterialAplicationMaterials,
} = MaterialAplicationSlice.actions;
export default MaterialAplicationSlice.reducer;
