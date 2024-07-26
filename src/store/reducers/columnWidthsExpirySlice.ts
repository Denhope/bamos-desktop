import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ColumnWidthsState {
  [key: string]: number;
}

const initialState: ColumnWidthsState = {};

export const columnWidthsExpirySlice = createSlice({
  name: 'columnWidthsExpiry',
  initialState,
  reducers: {
    setColumnWidthEzpiry: (
      state,
      action: PayloadAction<{ field: string; width: number }>
    ) => {
      const { field, width } = action.payload;
      state[field] = width;
    },
  },
});

export const { setColumnWidthEzpiry } = columnWidthsExpirySlice.actions;

export default columnWidthsExpirySlice.reducer;
