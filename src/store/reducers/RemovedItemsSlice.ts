import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { IPickSlipResponse } from "@/models/IPickSlip";
import {
  createRemoveItem,
  getAllPickSlips,
  getAllProjectRemovedItems,
  getSelectedItems,
  updateremovedItem,
} from "@/utils/api/thunks";

import { IRemovedItemResponce } from "@/models/IRemovedItem";

type RemovedItemsState = {
  removedItems: IRemovedItemResponce[];
  currentRemoveditem?: IRemovedItemResponce;
  itemsForPrint?: any;
  isLoading: boolean;
  removedItemsFetchError: string | null;
};

const initialState: RemovedItemsState = {
  isLoading: false,
  removedItemsFetchError: null,
  removedItems: [],
  itemsForPrint: [],
};

export const removedItemsSlice = createSlice({
  name: "removedItems",
  initialState,
  reducers: {
    setItemsForPrint: (
      state,
      action: PayloadAction<IRemovedItemResponce[]>
    ) => {
      state.itemsForPrint = action.payload;
    },
    setCurrentRemovedItem: (
      state,
      action: PayloadAction<IRemovedItemResponce>
    ) => {
      state.currentRemoveditem = action.payload;
    },
  },
  extraReducers: (builder) => {
    // updateremovedItem
    builder.addCase(updateremovedItem.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      updateremovedItem.fulfilled,
      (state, action: PayloadAction<IRemovedItemResponce>) => {
        state.isLoading = false;
        state.currentRemoveditem = action.payload;
      }
    );
    builder.addCase(
      updateremovedItem.rejected,
      (state, action: PayloadAction<any>) => {
        state.removedItemsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getSelectedItems
    builder.addCase(getSelectedItems.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getSelectedItems.fulfilled,
      (state, action: PayloadAction<IPickSlipResponse[] | any>) => {
        state.isLoading = false;
        state.itemsForPrint = action.payload;
      }
    );
    builder.addCase(
      getSelectedItems.rejected,
      (state, action: PayloadAction<any>) => {
        state.removedItemsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getAllProjectRemovedItems
    builder.addCase(getAllProjectRemovedItems.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getAllProjectRemovedItems.fulfilled,
      (state, action: PayloadAction<IRemovedItemResponce[]>) => {
        state.isLoading = false;
        state.removedItems = action.payload;
      }
    );
    builder.addCase(
      getAllProjectRemovedItems.rejected,
      (state, action: PayloadAction<any>) => {
        state.removedItemsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // createRemoveItem
    builder.addCase(createRemoveItem.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      createRemoveItem.fulfilled,
      (state, action: PayloadAction<IRemovedItemResponce>) => {
        state.isLoading = false;
        state.currentRemoveditem = action.payload;
      }
    );
    builder.addCase(
      createRemoveItem.rejected,
      (state, action: PayloadAction<any>) => {
        state.removedItemsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // ... (other cases for other actions)
  },
});
export const { setCurrentRemovedItem } = removedItemsSlice.actions;

export default removedItemsSlice.reducer;
