// redux/slices/riderOrderSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/utils/axiosInstance";

export interface RiderOrder {
  _id: string;
  address: string;
  receiver: string;
  phone: string;
  deliveryTime: string;
  status: string;
}

interface RiderOrderState {
  items: RiderOrder[];
  loading: boolean;
  error: string | null;
}

const initialState: RiderOrderState = {
  items: [],
  loading: false,
  error: null,
};

// ✅ 배정 전 주문 목록 불러오기
export const fetchAvailableOrders = createAsyncThunk(
  "riderOrders/fetchAvailable",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/orders/available");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "조회 실패");
    }
  }
);

// ✅ 특정 주문 배정하기
export const assignOrder = createAsyncThunk(
  "riderOrders/assignOrder",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`/orders/${orderId}/assign`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "배정 실패");
    }
  }
);

const riderOrderSlice = createSlice({
  name: "riderOrders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchAvailableOrders
      .addCase(fetchAvailableOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableOrders.fulfilled, (state, action: PayloadAction<RiderOrder[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAvailableOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // assignOrder
      .addCase(assignOrder.fulfilled, (state, action: PayloadAction<RiderOrder>) => {
        state.items = state.items.filter((order) => order._id !== action.payload._id);
      });
  },
});

export default riderOrderSlice.reducer;
