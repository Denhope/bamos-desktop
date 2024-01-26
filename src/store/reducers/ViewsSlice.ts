import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type ViewState = {
  isProjectTAskListFull: boolean;
  isLoading: boolean;
};

const initialState: ViewState = {
  isLoading: false,
  isProjectTAskListFull: true,
};

export const viewsSlice = createSlice({
  name: "viewsSlice",
  initialState,
  reducers: {
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setisProjectTAskListFull: (state, action: PayloadAction<boolean>) => {
      state.isProjectTAskListFull = action.payload;
    },
  },
});
export const { setIsLoading, setisProjectTAskListFull } = viewsSlice.actions;

export default viewsSlice.reducer;
