import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IVendor, UserGroup } from '@/models/IUser';
import { ITask } from '@/models/ITask';

// const initialState: IVendor[] = [];
interface taskstate {
  tasks: ITask[];
  isLoading?: boolean;
}

const initialState: taskstate = {
  tasks: [],
  isLoading: false,
};

const taskslice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<ITask[]>) => {
      state.tasks = action.payload;
    },
    addTasks: (state, action: PayloadAction<any>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<ITask>) => {
      const { id, ...updatedGroup } = action.payload;
      const index = state.tasks.findIndex((group) => group.id === id);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...updatedGroup };
      }
    },
    // deleteUserGroup: (state, action: PayloadAction<string>) => {
    //   return state.tasks.filter((group) => group.id !== action.payload);
    // },
  },
});

export const { addTasks, setTasks } = taskslice.actions;
export default taskslice.reducer;
