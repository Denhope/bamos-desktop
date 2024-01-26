// @ts-nocheck
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IInstData, IMatData } from "@/types/TypesData";
import { getAllInstruments } from "@/utils/api/thunks";

type InstrumentState = {
  allInstruments: IInstData[];
  currentInstruments: IInstData[];
  isLoading: boolean;
  allInstrumentsFetchError: string | null;
};

const initialState: InstrumentState = {
  isLoading: false,
  allInstruments: [],
  currentInstruments: [],
  allInstrumentsFetchError: null,
};

export const instrumentSlice = createSlice({
  name: "instrument",
  initialState,
  reducers: {
    // setAllFilteredInsrtument: (state, action: PayloadAction<IInstData[]>) => {
    //   state.list = action.payload;
    // },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllInstruments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        getAllInstruments.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.isLoading = false;
          state.allInstruments = action.payload;
        }
      )
      .addCase(
        getAllInstruments.rejected,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.allInstrumentsFetchError = action.payload;
          console.error(action.payload);
        }
      );
  },
});
// export const { setAllFilteredInsrtument } = instrumentSlice.actions;

export default instrumentSlice.reducer;
