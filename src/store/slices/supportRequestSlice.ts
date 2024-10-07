import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { $authHost } from '@/utils/api/http';
import { SubscriptionType } from '@/services/utilites';

interface SupportRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  requestType: SubscriptionType;
}

interface SupportRequestState {
  isLoading: boolean;
  error: string | null;
  lastSubmittedRequest: SupportRequest | null;
}

const initialState: SupportRequestState = {
  isLoading: false,
  error: null,
  lastSubmittedRequest: null,
};

export const submitSupportRequest = createAsyncThunk(
  'supportRequest/submit',
  async (request: SupportRequest, { rejectWithValue }) => {
    try {
      const response = await $authHost.post('/api/support-requests', request);
      return response.data;
    } catch (error) {
      return rejectWithValue('Не удалось отправить запрос в поддержку');
    }
  }
);

const supportRequestSlice = createSlice({
  name: 'supportRequest',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitSupportRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitSupportRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastSubmittedRequest = action.payload;
      })
      .addCase(submitSupportRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default supportRequestSlice.reducer;