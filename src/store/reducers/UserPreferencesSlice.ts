import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserPreferencesState {
  language: string;
}

const initialState: UserPreferencesState = {
  language: localStorage.getItem('lng') || 'ru',
};

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
  },
});

export const { setLanguage } = userPreferencesSlice.actions;

export default userPreferencesSlice.reducer;
