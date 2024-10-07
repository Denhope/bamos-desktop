import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAplicationInfo, IDTO, ITaskType } from '@/types/TypesData';
import { createNewAplications, getAllAplication } from '@/utils/api/thunks';

type AplicationState = {
  allAplications: IAplicationInfo[];
  isSetCurrentAplication: boolean;
  currentAplication: IAplicationInfo;
  isLoading: boolean;
  allAplicationsFetchError: string | null;
};

const initialState: AplicationState = {
  isLoading: false,
  isSetCurrentAplication: false,
  allAplications: [],
  currentAplication: {
    id: '',
    aplicationName: '',
    planeID: '',
    serviceType: '',
    companyID: '',
    dateOfAplication: undefined,
    routineTasks: [],
    additionalTasks: [],
    hardTimeTasks: [],
  },
  allAplicationsFetchError: null,
};
export const aplicationSlice = createSlice({
  name: 'aplication',
  initialState,
  reducers: {
    setCurrentAplication: (state, action: PayloadAction<IAplicationInfo>) => {
      state.currentAplication = action.payload;
      state.isSetCurrentAplication = true;
    },

    setRoutineTasksDto: (state, action: PayloadAction<IDTO[]>) => {
      state.currentAplication.routineTasks = action.payload;
    },
    setadditionalTasksDto: (state, action: PayloadAction<IDTO[]>) => {
      state.currentAplication.additionalTasks = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllAplication.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        getAllAplication.fulfilled,
        (state, action: PayloadAction<IAplicationInfo[]>) => {
          state.isLoading = false;
          state.allAplications = action.payload;
        }
      )
      .addCase(
        getAllAplication.rejected,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
          state.allAplicationsFetchError = action.payload;
          console.error(action.payload);
        }
      )
      .addCase(createNewAplications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        createNewAplications.fulfilled,
        (state, action: PayloadAction<IAplicationInfo>) => {
          state.isLoading = false;
          state.allAplications.push(action.payload);
        }
      )
      .addCase(
        createNewAplications.rejected,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
          state.allAplicationsFetchError = action.payload;
          console.error(action.payload);
        }
      );
  },
});
export const {
  setRoutineTasksDto,
  setadditionalTasksDto,
  setCurrentAplication,
} = aplicationSlice.actions;

export default aplicationSlice.reducer;
