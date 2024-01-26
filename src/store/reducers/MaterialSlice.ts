import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { getAllMaterials } from "@/utils/api/thunks";
import { IMatData } from "@/types/TypesData";

type MaterialState = {
  allMaterials: IMatData[];
  currentMaterial: IMatData[];
  isLoading: boolean;
  allMaterialFetchError: string | null;
};

const initialState: MaterialState = {
  isLoading: false,
  allMaterials: [],
  currentMaterial: [],
  allMaterialFetchError: null,
};

export const materialsSlice = createSlice({
  name: "allMaterials",
  initialState,
  reducers: {
    setCurrentMaterial: (state, action: PayloadAction<IMatData[]>) => {
      state.currentMaterial = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getAllMaterials.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        getAllMaterials.fulfilled,
        (state, action: PayloadAction<IMatData[]>) => {
          state.isLoading = false;
          state.allMaterials = action.payload;
        }
      )
      .addCase(getAllMaterials.rejected, (state, action) => {
        state.isLoading = false;
        state.allMaterialFetchError =
          action.error.message || "An error occurred";
        console.error(action.error);
      });
  },
});
export const { setCurrentMaterial } = materialsSlice.actions;

export default materialsSlice.reducer;
