import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callFetchAccount } from '@/config/api';

// First, create the thunk
export const fetchAccount = createAsyncThunk(
  'account/fetchAccount',
  async (_, { rejectWithValue }) => {
    const response = await callFetchAccount();
    // The axios interceptor resolves API errors as { statusCode, message } instead of throwing
    if (!response.data) return rejectWithValue(response.message);
    return response.data;
  }
);

interface IState {
  isAuthenticated: boolean;
  isLoading: boolean;
  authError?: string;
  user: {
    _id: string;
    email: string;
    name: string;
    role: {
      _id: string;
      name: string;
    };
    permissions: {
      _id: string;
      name: string;
      apiPath: string;
      method: string;
      module: string;
    }[];
  };
  activeMenu: string;
}

const emptyUser: IState['user'] = {
  _id: '',
  email: '',
  name: '',
  role: {
    _id: '',
    name: '',
  },
  permissions: [],
};

const initialState: IState = {
  isAuthenticated: false,
  isLoading: true,
  user: emptyUser,

  activeMenu: 'home',
};

export const accountSlide = createSlice({
  name: 'account',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setActiveMenu: (state, action) => {
      state.activeMenu = action.payload;
    },
    setLogoutAction: state => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.user = emptyUser;
    },
  },
  extraReducers: builder => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchAccount.pending, state => {
      state.isLoading = true;
      state.authError = undefined;
    });

    builder.addCase(fetchAccount.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.isAuthenticated = true;
        state.user._id = action?.payload?.user?._id;
        state.user.email = action.payload.user?.email;
        state.user.name = action.payload.user?.name;
        state.user.role = action?.payload?.user?.role;
        state.user.permissions = action?.payload?.user?.permissions;
      } else {
        state.isAuthenticated = false;
      }
    });

    builder.addCase(fetchAccount.rejected, (state, action) => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.authError = Array.isArray(action.payload)
        ? action.payload.join(', ')
        : (action.payload as string | undefined);
    });
  },
});

export const { setActiveMenu, setLogoutAction } = accountSlide.actions;

export default accountSlide.reducer;
