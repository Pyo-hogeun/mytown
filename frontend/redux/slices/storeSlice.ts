import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/utils/axiosInstance';

export type Store = {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  location?: {
    lat?: number;
    lng?: number;
  };
  createdAt: string;
};

interface StoreState {
  items: Store[];
  loading: boolean;
  error: string | null;
}

const initialState: StoreState = {
  items: [],
  loading: false,
  error: null,
};

// ✅ 비동기 thunk 추가 (기존 utils/api/stores.ts 로직 병합)
export const fetchStores = createAsyncThunk('store/fetchStores', async () => {
  const res = await axios.get('/stores');
  return res.data as Store[];
});

const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    setStores(state, action: PayloadAction<Store[]>) {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action:PayloadAction<Store[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch stores';
      });
  },
});

export const { setStores } = storeSlice.actions;
export default storeSlice.reducer;
