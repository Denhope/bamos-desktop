import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MenuItemsState {
  visibleMenuItems: string[];
}

const initialState: MenuItemsState = {
  visibleMenuItems: [],
};

const menuItemsSlice = createSlice({
  name: 'menuItems',
  initialState,
  reducers: {
    setVisibleMenuItems: (state, action: PayloadAction<string[]>) => {
      state.visibleMenuItems = action.payload;
    },
  },
});

export const { setVisibleMenuItems } = menuItemsSlice.actions;
export default menuItemsSlice.reducer;
