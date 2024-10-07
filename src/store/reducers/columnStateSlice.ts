import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ColumnState {
  visible: boolean;
  width?: number;
  sort?: 'asc' | 'desc' | null;
  order: number;
}

interface TableColumnState {
  [columnKey: string]: ColumnState;
}

interface ColumnStatePayload {
  tableId: string;
  columnState: TableColumnState;
}

interface ColumnStateStore {
  [tableId: string]: TableColumnState;
}

const initialState: ColumnStateStore = {};

const columnStateSlice = createSlice({
  name: 'columnState',
  initialState,
  reducers: {
    setColumnState: (state, action: PayloadAction<ColumnStatePayload>) => {
      const { tableId, columnState } = action.payload;
      state[tableId] = columnState;
    },
    updateColumnState: (state, action: PayloadAction<ColumnStatePayload>) => {
      const { tableId, columnState } = action.payload;
      state[tableId] = { ...state[tableId], ...columnState };
    },
    resetColumnState: (state, action: PayloadAction<{ tableId: string }>) => {
      const { tableId } = action.payload;
      delete state[tableId];
    },
    updateSingleColumn: (
      state,
      action: PayloadAction<{
        tableId: string;
        columnKey: string;
        columnState: Partial<ColumnState>;
      }>
    ) => {
      const { tableId, columnKey, columnState } = action.payload;
      if (state[tableId] && state[tableId][columnKey]) {
        state[tableId][columnKey] = { ...state[tableId][columnKey], ...columnState };
      }
    },
  },
});

export const {
  setColumnState,
  updateColumnState,
  resetColumnState,
  updateSingleColumn,
} = columnStateSlice.actions;

export default columnStateSlice.reducer;