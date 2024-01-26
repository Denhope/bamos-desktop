import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import {
  fetchCurrentMaterials,
  fetchSameMaterials,
  fetchTotalQuantity,
  updateAfterIssued,
  updateForReservation,
} from "@/utils/api/thunks";

import { IMaterialStoreRequestItem } from "@/models/IMaterialStoreItem";

type MaterialStoreState = {
  searchedItemQuantity: [{ _id: string; totalQuantity: number }] | [];
  searchedAllItemsQuantity: IMaterialStoreRequestItem[];
  searchedSameItemsQuantity: IMaterialStoreRequestItem[];
  updatedMaterialStoreItems: IMaterialStoreRequestItem[];
  isLoading: boolean;

  allMaterialStoreFetchError: string | null;
};

const initialState: MaterialStoreState = {
  isLoading: false,
  searchedItemQuantity: [],
  allMaterialStoreFetchError: null,
  searchedAllItemsQuantity: [],
  searchedSameItemsQuantity: [],
  updatedMaterialStoreItems: [],
};

export const MaterialStoreSlice = createSlice({
  name: "projectTasks",
  initialState,
  reducers: {
    setInitialMaterial: (state, action: PayloadAction<any>) => {
      state.searchedAllItemsQuantity = action.payload;
      state.searchedSameItemsQuantity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateForReservation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        updateForReservation.fulfilled,
        (state, action: PayloadAction<IMaterialStoreRequestItem>) => {
          state.isLoading = false;
          state.updatedMaterialStoreItems.push(action.payload);
        }
      )
      .addCase(updateForReservation.rejected, (state, action) => {
        state.isLoading = false;
        state.allMaterialStoreFetchError =
          action.error.message || "An error occurred";
        console.error(action.error);
      })
      .addCase(updateAfterIssued.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        updateAfterIssued.fulfilled,
        (state, action: PayloadAction<IMaterialStoreRequestItem>) => {
          state.isLoading = false;
          state.updatedMaterialStoreItems.push(action.payload);
        }
      )
      .addCase(updateAfterIssued.rejected, (state, action) => {
        state.isLoading = false;
        state.allMaterialStoreFetchError =
          action.error.message || "An error occurred";
        console.error(action.error);
      })
      .addCase(fetchSameMaterials.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchSameMaterials.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
          state.searchedSameItemsQuantity = action.payload;
        }
      )
      .addCase(fetchSameMaterials.rejected, (state, action) => {
        state.isLoading = false;
        state.allMaterialStoreFetchError =
          action.error.message || "An error occurred";
        console.error(action.error);
      })
      .addCase(fetchTotalQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchTotalQuantity.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
          state.searchedItemQuantity = action.payload;
        }
      )
      .addCase(fetchTotalQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.allMaterialStoreFetchError =
          action.error.message || "An error occurred";
        console.error(action.error);
      })
      .addCase(fetchCurrentMaterials.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchCurrentMaterials.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
          state.searchedAllItemsQuantity = action.payload;
        }
      )
      .addCase(fetchCurrentMaterials.rejected, (state, action) => {
        state.isLoading = false;
        state.allMaterialStoreFetchError =
          action.error.message || "An error occurred";
        console.error(action.error);
      });
  },
});
export const { setInitialMaterial } = MaterialStoreSlice.actions;
export default MaterialStoreSlice.reducer;
