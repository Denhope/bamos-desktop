import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  EditionActionType,
  TMaterialAplicationStatus,
} from "./ProjectTaskSlise";
import { IMaterialStoreRequestItem } from "@/models/IMaterialStoreItem";
import { IPickSlipResponse } from "@/models/IPickSlip";
import {
  IfeatchFilteredRequirements,
  createReturnSlip,
  getFilteredCancelMaterialOrders,
  reservationRequarementByIds,
  getFilteredRequirementsForecast,
  getFilteredUnserviseStockItems,
  getFilteredTransferStockItems,
  getFilteredStockDetails,
  getFilteredMaterialItemsStock,
  getFilteredItemsStockQuantity,
  getFilteredMaterialItems,
  createPickSlip,
  getFilteredMaterialOrders,
  getFilteredPickSlips,
  getFilteredRequirements,
} from "@/utils/api/thunks";

export type MaterialOrder = {
  materials: any;
  onBlock?: any;
  // materials: any;
  editedAction: EditionActionType;
  createBy?: string;
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
  additionalTaskID?: number | null;
  userId?: any;
  planeType?: string;
  registrationNumber?: string;
  materialAplicationNumber?: number | null;
  _id?: string;
  id?: string;
  status?: "open" | "closed" | "canceled" | "completed" | "issued";
  isPickSlipCreated?: boolean;
  pickSlipID?: string;
  pickSlipNumber?: number | null;
  planeNumber?: string;
  updateUserID?: string;
  updateBy?: string;
  updateDate?: any;
  storeMan?: string;
  recipient?: string;
  recipientSing?: any;
  recipientName?: string;
  storeManSing?: string;
  storeManName?: string;
};

type MaterialAplicationsState = {
  filteredMaterialOrders: MaterialOrder[] | [];
  currentMaterialOrder: MaterialOrder | null;
  isLoading: boolean;
  materialOrdersFetchError: string | null;
  filteredPickSlips: IPickSlipResponse[];
  filteredMaterialsItems: IMaterialStoreRequestItem[];
  filteredCurrentStockItems: IMaterialStoreRequestItem[];
  filteredStockDetails: IMaterialStoreRequestItem[];
  filteredUnserviceDetails: IMaterialStoreRequestItem[];
  filteredTransferItems: IMaterialStoreRequestItem[];
  selectedMaterial: any;
  filteredItemsStockQuantity: any | null;
  selectedFlterDate?: any;
  filteredRequirementsForecast: IfeatchFilteredRequirements[];
  filteredPickSlipsForCancel: MaterialOrder[] | [];
};

const initialState: MaterialAplicationsState = {
  filteredMaterialOrders: [],
  currentMaterialOrder: null,
  isLoading: false,
  materialOrdersFetchError: null,
  filteredPickSlips: [],
  filteredMaterialsItems: [],
  filteredCurrentStockItems: [],
  selectedMaterial: null,
  filteredItemsStockQuantity: null,
  filteredStockDetails: [],
  filteredUnserviceDetails: [],
  filteredTransferItems: [],
  selectedFlterDate: null,
  filteredRequirementsForecast: [],
  filteredPickSlipsForCancel: [],
};

export const MaterialOrderSlice = createSlice({
  name: "materialOrders",
  initialState,
  reducers: {
    setUpdatedMaterialOrderCancel: (
      state,
      action: PayloadAction<{ index: number; item: any }>
    ) => {
      state.filteredPickSlipsForCancel[action.payload.index] =
        action.payload.item;
    },
    setUpdatedMaterialOrder: (
      state,
      action: PayloadAction<{ index: number; item: any }>
    ) => {
      state.filteredMaterialOrders[action.payload.index] = action.payload.item;
    },
    setSelectedMaterial: (state, action: PayloadAction<any>) => {
      state.selectedMaterial = action.payload;
    },
    setSelectedFlterDate: (state, action: PayloadAction<any>) => {
      state.selectedFlterDate = action.payload;
    },
    setFilteredCurrentStockItems: (state, action: PayloadAction<any>) => {
      state.filteredCurrentStockItems = action.payload;
    },
  },

  extraReducers: (builder) => {
    // createReturnSlip
    builder.addCase(createReturnSlip.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      createReturnSlip.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
      }
    );
    builder.addCase(
      createReturnSlip.rejected,
      (state, action: PayloadAction<any>) => {
        state.materialOrdersFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getFilteredCancelMaterialOrders
    builder.addCase(getFilteredCancelMaterialOrders.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredCancelMaterialOrders.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.filteredPickSlipsForCancel = action.payload;
      }
    );
    builder.addCase(
      getFilteredCancelMaterialOrders.rejected,
      (state, action: PayloadAction<any>) => {
        state.materialOrdersFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // reservationRequarementByIds
    builder.addCase(reservationRequarementByIds.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      reservationRequarementByIds.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
      }
    );
    builder.addCase(
      reservationRequarementByIds.rejected,
      (state, action: PayloadAction<any>) => {
        state.materialOrdersFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getFilteredRequirementsForecast
    builder.addCase(getFilteredRequirementsForecast.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredRequirementsForecast.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.filteredRequirementsForecast = action.payload;
      }
    );
    builder.addCase(
      getFilteredRequirementsForecast.rejected,
      (state, action: PayloadAction<any>) => {
        state.materialOrdersFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getFilteredUnserviseStockItems
    builder.addCase(getFilteredUnserviseStockItems.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredUnserviseStockItems.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.filteredUnserviceDetails = action.payload;
      }
    );
    builder.addCase(
      getFilteredUnserviseStockItems.rejected,
      (state, action: PayloadAction<any>) => {
        state.materialOrdersFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getFilteredTransferStockItems
    builder.addCase(getFilteredTransferStockItems.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredTransferStockItems.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.filteredTransferItems = action.payload;
      }
    );
    builder.addCase(
      getFilteredTransferStockItems.rejected,
      (state, action: PayloadAction<any>) => {
        state.materialOrdersFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getFilteredStockDetails
    builder.addCase(getFilteredStockDetails.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredStockDetails.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.filteredStockDetails = action.payload;
      }
    );
    builder.addCase(
      getFilteredStockDetails.rejected,
      (state, action: PayloadAction<any>) => {
        state.materialOrdersFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getFilteredMaterialItemsStock
    builder.addCase(getFilteredMaterialItemsStock.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredMaterialItemsStock.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.filteredCurrentStockItems = action.payload;
      }
    );
    builder.addCase(
      getFilteredMaterialItemsStock.rejected,
      (state, action: PayloadAction<any>) => {
        state.materialOrdersFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );
    builder.addCase(getFilteredItemsStockQuantity.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredItemsStockQuantity.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.filteredItemsStockQuantity = action.payload;
      }
    );
    builder.addCase(
      getFilteredItemsStockQuantity.rejected,
      (state, action: PayloadAction<any>) => {
        state.materialOrdersFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getFilteredMaterialItems
    builder.addCase(getFilteredMaterialItems.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredMaterialItems.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.filteredMaterialsItems.push(action.payload);
      }
    );
    builder.addCase(
      getFilteredMaterialItems.rejected,
      (state, action: PayloadAction<any>) => {
        state.materialOrdersFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // createPickSlip
    builder.addCase(createPickSlip.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      createPickSlip.fulfilled,
      (state, action: PayloadAction<IPickSlipResponse>) => {
        state.isLoading = false;
        state.filteredPickSlips.push(action.payload);
      }
    );
    builder.addCase(
      createPickSlip.rejected,
      (state, action: PayloadAction<any>) => {
        state.materialOrdersFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getFilteredMaterialOrders
    builder.addCase(getFilteredMaterialOrders.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredMaterialOrders.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.filteredMaterialOrders = action.payload;
      }
    );
    builder.addCase(
      getFilteredMaterialOrders.rejected,
      (state, action: PayloadAction<any>) => {
        state.materialOrdersFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // getFilteredPickSlips
    builder.addCase(getFilteredPickSlips.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getFilteredPickSlips.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.filteredPickSlips = action.payload;
      }
    );
    builder.addCase(
      getFilteredPickSlips.rejected,
      (state, action: PayloadAction<any>) => {
        state.materialOrdersFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

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
        state.materialOrdersFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );
  },
});

export const {
  setUpdatedMaterialOrder,
  setUpdatedMaterialOrderCancel,
  setSelectedMaterial,
  setFilteredCurrentStockItems,
  setSelectedFlterDate,
} = MaterialOrderSlice.actions;
export default MaterialOrderSlice.reducer;
