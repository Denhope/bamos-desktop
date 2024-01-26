import { IRequiredItemMaterialResponse } from "@/models/IStatistics";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { getAllProjectMaterialsForStatistic } from "@/utils/api/thunks";

type StatisticsState = {
  requaredMaterialItems: IRequiredItemMaterialResponse[];
  isLoading: boolean;
  requaredMaterialItemsFetchError: string | null;
};

const initialState: StatisticsState = {
  isLoading: false,
  requaredMaterialItemsFetchError: null,
  requaredMaterialItems: [],
};

export const statisticsStateSlice = createSlice({
  name: "statistics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // getAllProjectMaterialsForStatistic
    builder.addCase(getAllProjectMaterialsForStatistic.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getAllProjectMaterialsForStatistic.fulfilled,
      (state, action: PayloadAction<IRequiredItemMaterialResponse[]>) => {
        state.isLoading = false;
        state.requaredMaterialItems = action.payload;
      }
    );
    builder.addCase(
      getAllProjectMaterialsForStatistic.rejected,
      (state, action: PayloadAction<any>) => {
        state.requaredMaterialItemsFetchError = action.payload;
        console.error(action.payload);
        state.isLoading = false;
      }
    );

    // ... (other cases for other actions)
  },
});

export default statisticsStateSlice.reducer;
