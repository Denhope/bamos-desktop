import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CardPositionState {
  position: { x: number; y: number };
}

const initialState: CardPositionState = {
  position: { x: 0, y: 0 },
};

const cardPositionSlice = createSlice({
  name: 'cardPosition',
  initialState,
  reducers: {
    setCardPosition: (
      state,
      action: PayloadAction<{ x: number; y: number }>
    ) => {
      state.position = action.payload;
    },
  },
});

export const { setCardPosition } = cardPositionSlice.actions;
export default cardPositionSlice.reducer;
