import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ColumnWidthsState {
  [key: string]: number;
}

const initialState: ColumnWidthsState = {};

export const columnWidthsSlice = createSlice({
  name: 'columnWidths',
  initialState,
  reducers: {
    setColumnWidth: (
      state,
      action: PayloadAction<{ field: string; width: number }>
    ) => {
      const { field, width } = action.payload;
      state[field] = width;
    },
  },
});

export const { setColumnWidth } = columnWidthsSlice.actions;

export default columnWidthsSlice.reducer;
