import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { callFetchAppliedJobs, IAppliedJob } from '@/config/api';
import { setLogoutAction } from './accountSlide';

interface IState {
  // jobId -> latest application of the current user
  byJob: Record<string, IAppliedJob>;
  isLoaded: boolean;
}

const initialState: IState = {
  byJob: {},
  isLoaded: false,
};

// Loaded after sign-in so a job the candidate already applied to can't be applied to again
export const fetchAppliedJobs = createAsyncThunk('appliedJob/fetchAppliedJobs', async () => {
  const response = await callFetchAppliedJobs();
  return response.data ?? [];
});

export const appliedJobSlide = createSlice({
  name: 'appliedJob',
  initialState,
  reducers: {
    addAppliedJob: (state, action: PayloadAction<IAppliedJob>) => {
      state.byJob[action.payload.jobId] = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchAppliedJobs.fulfilled, (state, action) => {
      state.byJob = Object.fromEntries(action.payload.map(item => [item.jobId, item]));
      state.isLoaded = true;
    });
    builder.addCase(setLogoutAction, () => initialState);
  },
});

export const { addAppliedJob } = appliedJobSlide.actions;

export default appliedJobSlide.reducer;
