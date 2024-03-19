import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IVendor, UserGroup } from '@/models/IUser';
import { ITask } from '@/models/ITask';

// const initialState: IVendor[] = [];
interface taskstate {
  planes: any[];
  isLoading?: boolean;
}

const initialState: taskstate = {
  planes: [],
  isLoading: false,
};

const taskslice = createSlice({
  name: 'planes',
  initialState,
  reducers: {
    setPlanes: (state, action: PayloadAction<any[]>) => {
      state.planes = action.payload;
    },
    addTasks: (state, action: PayloadAction<any>) => {
      state.planes.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<any>) => {
      const { id, ...updatedGroup } = action.payload;
      const index = state.planes.findIndex((group) => group.id === id);
      if (index !== -1) {
        state.planes[index] = { ...state.planes[index], ...updatedGroup };
      }
    },
    // deleteUserGroup: (state, action: PayloadAction<string>) => {
    //   return state.tasks.filter((group) => group.id !== action.payload);
    // },
  },
});

export const { addTasks, setPlanes } = taskslice.actions;
export default taskslice.reducer;
