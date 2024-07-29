import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ColumnWidthsState {
  [key: string]: number;
}

const initialState: ColumnWidthsState = {};

export const columnWidthrReqlice = createSlice({
  name: 'columnWidthrReq',
  initialState,
  reducers: {
    setColumnWidthReq: (
      state,
      action: PayloadAction<{ field: string; width: number }>
    ) => {
      const { field, width } = action.payload;
      state[field] = width;
    },
  },
});

export const { setColumnWidthReq } = columnWidthrReqlice.actions;

export default columnWidthrReqlice.reducer;
