// redux/slices/riderOrderSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/utils/axiosInstance";

export interface RiderOrder {
  _id: string;
  address: string;
  receiver: string;
  phone: string;
  deliveryTime: {
    day: string;
    time: string;
  };
  status: string;
}

export interface OrderItem {
  product: string;
  quantity: number;
  unitPrice: number;
  optionName?: string;
}

export interface OrderDetail {
  _id: string;
  store: {
    name: string;
    address: string;
  };
  receiver: string;
  phone: string;
  address: string;
  totalPrice: number;
  status: string;
  deliveryTime?: string;
  orderItems: OrderItem[];
}

interface RiderOrderState {
  currentOrders: OrderDetail[]; // ✅ 여러 개 조회 가능
  selectedOrder: OrderDetail | null; // ✅ 단건 상세 저장
  items: RiderOrder[];
  loading: boolean;
  error: string | null;
}

const initialState: RiderOrderState = {
  currentOrders: [],
  selectedOrder: null,
  items: [],
  loading: false,
  error: null,
};

// ✅ 배정 전 주문 목록 불러오기
export const fetchAvailableOrders = createAsyncThunk(
  "riderOrders/fetchAvailable",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/order/rider/available");
      return res.data.orders;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "조회 실패");
    }
  }
);

// ✅ 배정된 주문 조회 (로그인된 rider 기준)
export const fetchAssignedOrders = createAsyncThunk(
  "riderOrders/fetchAssigned",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/order/rider/assigned");
      return res.data.orders as OrderDetail[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "배정 주문 조회 실패");
    }
  }
);

// ✅ 단건 주문 조회
export const fetchOrderById = createAsyncThunk(
  "riderOrders/fetchOrderById",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/order/${orderId}`);
      return res.data.order as OrderDetail;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "주문 단건 조회 실패");
    }
  }
);


// ✅ 특정 주문 배정하기
export const assignOrder = createAsyncThunk(
  "riderOrders/assignOrder",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/order/rider/${orderId}/assign`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "배정 실패");
    }
  }
);

const riderOrderSlice = createSlice({
  name: "riderOrders",
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.currentOrders = [];
      state.error = null;
    },
  },
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
      })
      // fetchAssignedOrders
      .addCase(fetchAssignedOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignedOrders.fulfilled, (state, action: PayloadAction<OrderDetail[]>) => {
        state.loading = false;
        state.currentOrders = action.payload;
      })
      .addCase(fetchAssignedOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOrders } = riderOrderSlice.actions;
export default riderOrderSlice.reducer;
