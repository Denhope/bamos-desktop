// @ts-nocheck
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAuth } from '@/models/IAuth';
import { IState } from '@/store/types';
import { registration, getNewUserTokens } from '../../utils/api/thunks';
import { login } from '../../utils/api/thunks';
import { IUser } from '@/models/IUser';

const initialState: IState = {
  isLoading: false,
  userCreationError: null,
  isAuth: false,
  user: {
    message: '',
    token: '',
    refreshToken: '',
    userId: '',
    name: '',
    role: '',
    permissions: '',
  },
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIsAuth: (state, action: PayloadAction<boolean>) => {
      state.isAuth = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUserData(state, action: PayloadAction<IAuth>) {
      state.user = action.payload;
    },
    setAuthUserName(state, action: PayloadAction<any>) {
      state.user.name = action.payload;
    },
    setAuthUserId(state, action: PayloadAction<any>) {
      state.user.userId = action.payload;
    },
    setAuthUserRole(state, action: PayloadAction<any>) {
      state.user.role = action.payload;
    },
    setAuthUserPermissions(state, action: PayloadAction<any>) {
      state.user.permissions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registration.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        registration.fulfilled,
        (state, action: PayloadAction<IUser>) => {
          state.user = action.payload;
          state.isLoading = false;
          state.userCreationError = null;
        }
      )
      .addCase(
        registration.rejected,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.userCreationError = action.payload;
          console.error(action.payload);
        }
      )
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.user = action.payload;
        state.isLoading = false;
        state.userCreationError = null;
        state.isAuth = true;
      })
      .addCase(login.rejected, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.userCreationError = action.payload;
        console.error(action.payload);
      })
      .addCase(getNewUserTokens.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        getNewUserTokens.fulfilled,
        (state, action: PayloadAction<IAuth>) => {
          state.isLoading = false;
          if (state.user) {
            state.user.token = action.payload.token;
            state.user.refreshToken = action.payload.refreshToken;
          }
        }
      )
      .addCase(getNewUserTokens.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
  setIsAuth,
  setAuthUserName,
  setAuthUserId,
  setAuthUserRole,
  setAuthUserPermissions,
} = authSlice.actions;

export default authSlice.reducer;
