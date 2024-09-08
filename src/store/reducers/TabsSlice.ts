// reducers/TabsSlice.ts
import { RouteNames } from '@/router';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TabData {
  key: string;
  title: any;
  contentKey: string; // Изменено на contentKey
  closable: boolean;
}

interface TabsState {
  panes: TabData[];
  activeKey: string;
}

const initialState: TabsState = {
  panes: [
    {
      key: RouteNames.HOME,
      title: '|^|',
      contentKey: RouteNames.HOME,
      closable: false,
    },
  ],
  activeKey: RouteNames.HOME,
};

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    addTab: (state, action: PayloadAction<TabData>) => {
      const existingTab = state.panes.some(
        (pane) => pane.key === action.payload.key
      );
      if (!existingTab) {
        state.panes.push(action.payload);
      }
      state.activeKey = action.payload.key;
    },
    removeTab: (state, action: PayloadAction<string>) => {
      if (action.payload !== RouteNames.HOME) {
        state.panes = state.panes.filter((pane) => pane.key !== action.payload);
        if (state.panes.length > 0) {
          state.activeKey = state.panes[state.panes.length - 1].key;
        }
      }
    },
    setActiveKey: (state, action: PayloadAction<string>) => {
      state.activeKey = action.payload;
    },
  },
});

export const { addTab, removeTab, setActiveKey } = tabsSlice.actions;
export default tabsSlice.reducer;
