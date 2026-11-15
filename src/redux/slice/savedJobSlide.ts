import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { callFetchSavedJobIds } from '@/config/api';
import { setLogoutAction } from './accountSlide';

interface IState {
  ids: string[];
  isLoaded: boolean;
}

const initialState: IState = {
  ids: [],
  isLoaded: false,
};

// Loaded once after sign-in so every job card knows whether it is saved
export const fetchSavedJobIds = createAsyncThunk('savedJob/fetchSavedJobIds', async () => {
  const response = await callFetchSavedJobIds();
  return response.data ?? [];
});

export const savedJobSlide = createSlice({
  name: 'savedJob',
  initialState,
  reducers: {
    setJobSaved: (state, action: PayloadAction<{ jobId: string; saved: boolean }>) => {
      const { jobId, saved } = action.payload;
      state.ids = state.ids.filter(id => id !== jobId);
      if (saved) state.ids.unshift(jobId);
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchSavedJobIds.fulfilled, (state, action) => {
      state.ids = action.payload;
      state.isLoaded = true;
    });
    builder.addCase(setLogoutAction, () => initialState);
  },
});

export const { setJobSaved } = savedJobSlide.actions;

export default savedJobSlide.reducer;
