import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FormValuesState {
  [formKey: string]: { [key: string]: any };
}

const initialState: FormValuesState = {};

export const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setFormValues: (
      state,
      action: PayloadAction<{ formKey: string; values: { [key: string]: any } }>
    ) => {
      const { formKey, values } = action.payload;
      state[formKey] = { ...state[formKey], ...values };
    },
    resetFormValues: (state, action: PayloadAction<{ formKey: string }>) => {
      const { formKey } = action.payload;
      state[formKey] = {};
    },
  },
});

export const { setFormValues, resetFormValues } = formSlice.actions;

export default formSlice.reducer;
