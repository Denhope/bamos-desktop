// @ts-nocheck
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ColumnVisibility {
  [columnId: string]: boolean;
}

interface ColumnWidths {
  [columnId: string]: number;
}

interface TableState {
  order: string[];
  visibility: ColumnVisibility;
  widths: ColumnWidths;
  pagination: boolean;
}

interface ColumnState {
  [tableId: string]: TableState;
}

const initialState: ColumnState = {
  partAdminPanel: {
    order: [],
    visibility: {},
    widths: {},
    pagination: true,
  },
};

const columnStateSlice = createSlice({
  name: 'columnState',
  initialState,
  reducers: {
    setColumnOrder: (
      state,
      action: PayloadAction<{ tableId: string; order: string[] }>
    ) => {
      const { tableId, order } = action.payload;
      if (!state[tableId]) {
        state[tableId] = { order: [], visibility: {}, widths: {} };
      }
      state[tableId].order = order;
    },
    setColumnVisibility: (
      state,
      action: PayloadAction<{
        tableId: string;
        columnId: string;
        isVisible: boolean;
      }>
    ) => {
      const { tableId, columnId, isVisible } = action.payload;
      if (!state[tableId]) {
        state[tableId] = { order: [], visibility: {}, widths: {} };
      }
      state[tableId].visibility[columnId] = isVisible;
    },
    setColumnWidth: (
      state,
      action: PayloadAction<{
        tableId: string;
        columnId: string;
        width: number;
      }>
    ) => {
      const { tableId, columnId, width } = action.payload;
      if (!state[tableId]) {
        state[tableId] = {
          order: [],
          visibility: {},
          widths: {},
          pagination: true,
        };
      }
      if (!state[tableId].widths) {
        state[tableId].widths = {};
      }
      state[tableId].widths[columnId] = width;
    },
    setPagination: (
      state,
      action: PayloadAction<{ tableId: string; isPaginationEnabled: boolean }>
    ) => {
      const { tableId, isPaginationEnabled } = action.payload;
      if (!state[tableId]) {
        state[tableId] = {
          order: [],
          visibility: {},
          widths: {},
          pagination: true,
        };
      }
      state[tableId].pagination = isPaginationEnabled;
    },
    initializeTableState: (
      state,
      action: PayloadAction<{
        tableId: string;
        columnDefs: any[];
        pagination: boolean;
      }>
    ) => {
      const { tableId, columnDefs, pagination } = action.payload;
      if (!state[tableId]) {
        state[tableId] = {
          order: columnDefs.map((col) => col.field).filter(Boolean),
          visibility: columnDefs.reduce((acc, col) => {
            if (col.field) {
              acc[col.field] = true;
            }
            return acc;
          }, {} as ColumnVisibility),
          widths: columnDefs.reduce((acc, col) => {
            if (col.field && col.width) {
              acc[col.field] = col.width;
            }
            return acc;
          }, {} as ColumnWidths),
          pagination,
        };
      }
    },
  },
});

export const {
  setColumnOrder,
  setColumnVisibility,
  setColumnWidth,
  setPagination,
  initializeTableState,
} = columnStateSlice.actions;
export default columnStateSlice.reducer;
