import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IVendor, UserGroup } from '@/models/IUser';

// const initialState: IVendor[] = [];
interface VendorState {
  vendors: IVendor[];
  isLoading?: boolean;
}

const initialState: VendorState = {
  vendors: [],
  isLoading: false,
};

const vendorSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    setVendors: (state, action: PayloadAction<IVendor[]>) => {
      state.vendors = action.payload;
    },
    addUserGroup: (state, action: PayloadAction<any>) => {
      state.vendors.push(action.payload);
    },
    updateUserGroup: (state, action: PayloadAction<IVendor>) => {
      const { id, ...updatedGroup } = action.payload;
      const index = state.vendors.findIndex((group) => group.id === id);
      if (index !== -1) {
        state.vendors[index] = { ...state.vendors[index], ...updatedGroup };
      }
    },
    // deleteUserGroup: (state, action: PayloadAction<string>) => {
    //   return state.vendors.filter((group) => group.id !== action.payload);
    // },
  },
});

export const { setVendors } = vendorSlice.actions;
export default vendorSlice.reducer;
