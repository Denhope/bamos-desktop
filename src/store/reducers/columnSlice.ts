import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ColumnState {
  [gridKey: string]: {
    columnState: any;
    columnVisible: any;
    columnOrder: any;
  };
}

const initialState: ColumnState = {};

export const columnSlice = createSlice({
  name: 'columns',
  initialState,
  reducers: {
    setColumnState: (
      state,
      action: PayloadAction<{ gridKey: string; columnState: any }>
    ) => {
      const { gridKey, columnState } = action.payload;
      console.log(`Setting column state for gridKey: ${gridKey}`, columnState);
      if (!state[gridKey]) {
        state[gridKey] = {
          columnState: {},
          columnVisible: {},
          columnOrder: {},
        };
      }
      state[gridKey].columnState = columnState;
    },
    setColumnVisible: (
      state,
      action: PayloadAction<{ gridKey: string; columnVisible: any }>
    ) => {
      const { gridKey, columnVisible } = action.payload;
      console.log(
        `Setting column visibility for gridKey: ${gridKey}`,
        columnVisible
      );
      if (!state[gridKey]) {
        state[gridKey] = {
          columnState: {},
          columnVisible: {},
          columnOrder: {},
        };
      }
      state[gridKey].columnVisible = columnVisible;
    },
    setColumnOrder: (
      state,
      action: PayloadAction<{ gridKey: string; columnOrder: any }>
    ) => {
      const { gridKey, columnOrder } = action.payload;
      console.log(`Setting column order for gridKey: ${gridKey}`, columnOrder);
      if (!state[gridKey]) {
        state[gridKey] = {
          columnState: {},
          columnVisible: {},
          columnOrder: {},
        };
      }
      state[gridKey].columnOrder = columnOrder;
    },
  },
});

export const { setColumnState, setColumnVisible, setColumnOrder } =
  columnSlice.actions;

export default columnSlice.reducer;
