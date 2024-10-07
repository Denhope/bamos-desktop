import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IACType } from '@/models/AC';

interface ACTypeState {
  acTypes: IACType[];
  isLoading?: boolean;
}

const initialState: ACTypeState = {
  acTypes: [],
  isLoading: false,
};

const acTypesSlice = createSlice({
  name: 'acTypes',
  initialState,
  reducers: {
    setACTypes: (state, action: PayloadAction<IACType[]>) => {
      state.acTypes = action.payload;
    },
    addACTypes: (state, action: PayloadAction<any>) => {
      state.acTypes.push(action.payload);
    },
    updateACTypes: (state, action: PayloadAction<IACType>) => {
      const { id, ...updatedTypes } = action.payload;
      const index = state.acTypes.findIndex((group) => group.id === id);
      if (index !== -1) {
        state.acTypes[index] = { ...state.acTypes[index], ...updatedTypes };
      }
    },
    // deleteUserGroup: (state, action: PayloadAction<string>) => {
    //   return state.vendors.filter((group) => group.id !== action.payload);
    // },
  },
});

export const { setACTypes } = acTypesSlice.actions;
export default acTypesSlice.reducer;
