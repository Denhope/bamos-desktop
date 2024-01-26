import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { IPickSlipResponse } from "@/models/IPickSlip";
import {
  createPurchaseItems,
  getAllPurchaseItems,
  updatePushesItem,
} from "@/utils/api/thunks";

import { IPurchaseItem } from "@/models/IPurchaseItem";
import { IPurchaseMaterial } from "@/types/TypesData";

type PurchaseItemState = {
  purchaseItems: IPurchaseMaterial[];
  currentPurchaseItem?: IPurchaseMaterial;
  isLoading: boolean;
  purchaseItemsFetchError: string | null;
};

const initialState: PurchaseItemState = {
  isLoading: false,
  purchaseItemsFetchError: null,
  purchaseItems: [],
};

export const purchaseItemStateSlice = createSlice({
  name: "purchases",
  initialState,
  reducers: {
    setCurrentpurchaseItem: (
      state,
      action: PayloadAction<IPurchaseMaterial>
    ) => {
      state.currentPurchaseItem = action.payload;
    },
  },
  extraReducers: (builder) => {
    // getAllPurchaseItems
    builder.addCase(getAllPurchaseItems.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getAllPurchaseItems.fulfilled,
      (state, action: PayloadAction<IPurchaseMaterial[]>) => {
        state.isLoading = false;
        state.purchaseItems = action.payload;
      }
    );
    builder.addCase(
      getAllPurchaseItems.rejected,
      (state, action: PayloadAction<any>) => {
        state.purchaseItemsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // createPurchaseItems
    builder.addCase(createPurchaseItems.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      createPurchaseItems.fulfilled,
      (state, action: PayloadAction<IPurchaseItem[] | any>) => {
        state.isLoading = false;
        // Assuming you want to update the state with the new items
        state.purchaseItems = [...state.purchaseItems, ...action.payload];
      }
    );
    builder.addCase(
      createPurchaseItems.rejected,
      (state, action: PayloadAction<any>) => {
        state.purchaseItemsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // updatePushesItem
    builder.addCase(updatePushesItem.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      updatePushesItem.fulfilled,
      (state, action: PayloadAction<IPurchaseMaterial>) => {
        state.isLoading = false;
        state.currentPurchaseItem = action.payload;
        // If you want to update the item in the state array, you would need to find and replace it
        // state.purchaseItems = state.purchaseItems.map(item => item.id === action.payload.id ? action.payload : item);
      }
    );
    builder.addCase(
      updatePushesItem.rejected,
      (state, action: PayloadAction<any>) => {
        state.purchaseItemsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // ... (other cases for other actions)
  },
});
export const { setCurrentpurchaseItem } = purchaseItemStateSlice.actions;

export default purchaseItemStateSlice.reducer;
