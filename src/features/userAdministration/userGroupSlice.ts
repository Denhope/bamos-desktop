import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserGroup } from '@/models/IUser';

const initialState: UserGroup[] = [];

const userGroupSlice = createSlice({
  name: 'userGroup',
  initialState,
  reducers: {
    setUserGroups: (state, action: PayloadAction<UserGroup[]>) => {
      return action.payload;
    },
    addUserGroup: (state, action: PayloadAction<any>) => {
      state.push(action.payload);
    },
    updateUserGroup: (state, action: PayloadAction<UserGroup>) => {
      const { id, ...updatedGroup } = action.payload;
      const index = state.findIndex((group) => group.id === id);
      if (index !== -1) {
        state[index] = { ...state[index], ...updatedGroup };
      }
    },
    deleteUserGroup: (state, action: PayloadAction<string>) => {
      return state.filter((group) => group.id !== action.payload);
    },
  },
});

export const { setUserGroups, addUserGroup, updateUserGroup, deleteUserGroup } =
  userGroupSlice.actions;
export default userGroupSlice.reducer;
