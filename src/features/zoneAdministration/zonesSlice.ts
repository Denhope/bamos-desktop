import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IZoneCodeGroup } from '@/models/ITask';

interface ZonesState {
  zonesGroup: IZoneCodeGroup[];
  isLoading?: boolean;
}
const initialState: ZonesState = {
  zonesGroup: [],
  isLoading: false,
};

const zonesGroupSlice = createSlice({
  name: 'zonesGroup',
  initialState,
  reducers: {
    setZonesGroups: (state, action: PayloadAction<IZoneCodeGroup[]>) => {
      state.zonesGroup = action.payload;
    },
  },
});

export const { setZonesGroups } = zonesGroupSlice.actions;
export default zonesGroupSlice.reducer;
