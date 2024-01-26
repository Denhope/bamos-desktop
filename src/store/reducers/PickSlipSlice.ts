import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { IPickSlipResponse } from "@/models/IPickSlip";
import {
  createPickSlip,
  getAllPickSlips,
  updatePickSlip,
} from "@/utils/api/thunks";

type PickSlipState = {
  pickSlips: IPickSlipResponse[];
  currentPickSlip?: IPickSlipResponse;
  isLoading: boolean;
  pickSlipFetchError: string | null;
};

const initialState: PickSlipState = {
  isLoading: false,
  pickSlipFetchError: null,
  pickSlips: [],
};

export const pickSlipSlice = createSlice({
  name: "pickSlips",
  initialState,
  reducers: {
    setCurrentPickSlip: (state, action: PayloadAction<IPickSlipResponse>) => {
      state.currentPickSlip = action.payload;
    },
  },
  extraReducers: (builder) => {
    // updatePickSlip
    builder.addCase(updatePickSlip.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      updatePickSlip.fulfilled,
      (state, action: PayloadAction<IPickSlipResponse>) => {
        state.isLoading = false;
        state.currentPickSlip = action.payload;
      }
    );
    builder.addCase(
      updatePickSlip.rejected,
      (state, action: PayloadAction<string | any>) => {
        state.isLoading = false;
        if (typeof action.payload === "string") {
          state.pickSlipFetchError = action.payload;
        } else {
          state.pickSlipFetchError = action.payload.message;
        }
        console.error(action.payload);
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
        state.pickSlips.push(action.payload);
      }
    );
    builder.addCase(
      createPickSlip.rejected,
      (state, action: PayloadAction<string | any>) => {
        state.isLoading = false;
        if (typeof action.payload === "string") {
          state.pickSlipFetchError = action.payload;
        } else {
          state.pickSlipFetchError = action.payload.message;
        }
        console.error(action.payload);
      }
    );

    // getAllPickSlips
    builder.addCase(getAllPickSlips.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getAllPickSlips.fulfilled,
      (state, action: PayloadAction<IPickSlipResponse[]>) => {
        state.isLoading = false;
        state.pickSlips = action.payload;
      }
    );
    builder.addCase(
      getAllPickSlips.rejected,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (typeof action.payload === "string") {
          state.pickSlipFetchError = action.payload;
        } else {
          state.pickSlipFetchError = action.payload.message;
        }
        console.error(action.payload);
      }
    );
  },
});
export const { setCurrentPickSlip } = pickSlipSlice.actions;

export default pickSlipSlice.reducer;
