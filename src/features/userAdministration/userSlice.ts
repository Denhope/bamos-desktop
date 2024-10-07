import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserGroup } from '@/models/IUser';

interface UserState {
  users: User[];
  usersGroup: UserGroup[];
}

const initialState: UserState = {
  users: [],
  usersGroup: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsersGroup: (state, action: PayloadAction<UserGroup[]>) => {
      state.usersGroup = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const { id, ...updatedUser } = action.payload;
      const index = state.users.findIndex((user) => user.id === id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...updatedUser };
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((user) => user.id !== action.payload);
    },
  },
});

export const { setUsersGroup, addUser, updateUser, deleteUser } =
  userSlice.actions;
export default userSlice.reducer;
