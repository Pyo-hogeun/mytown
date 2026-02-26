// redux/slices/riderOrderSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/utils/axiosInstance";
import { OrderStatus } from "./orderSlice";

export interface RiderOrder {
  _id: string;
  address: string;
  receiver: string;
  phone: string;
  deliveryTime: {
    day: string;
    time: string;
  };
  deliveryCharge: number;
  status: OrderStatus;
}

export interface OrderItem {
  product: { _id: string; name?: string; price?: number };
  quantity: number;
  unitPrice: number;
  optionName?: string;
  optionExtraPrice?: string;
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
  status: OrderStatus;
  deliveryTime: {
    day: string;
    time: string;
  };
  deliveryCharge: number;
  orderItems: OrderItem[];
  deliveryProofImage?: string;
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
// ✅ 배달완료된 주문 조회 (로그인된 rider 기준)
export const fetchCompletedOrders = createAsyncThunk(
  "riderOrders/fetchCompleted",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/order/rider/completed");
      return res.data.orders as OrderDetail[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "배달완료된 주문 조회 실패");
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

// ✅ 주문 상태 업데이트
export const updateOrderStatus = createAsyncThunk(
  "riderOrders/updateOrderStatus",
  async (
    {
      orderId,
      status,
      deliveryProofImage,
    }: { orderId: string; status: OrderStatus; deliveryProofImage?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.patch(`/order/rider/${orderId}/status`, { status, deliveryProofImage });
      return res.data.order as OrderDetail;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "주문 상태 업데이트 실패");
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
      })
      // fetchOrderById
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<OrderDetail>) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // updateOrderStatus
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<OrderDetail>) => {
        state.loading = false;
        // 1) 목록(currentOrders)에서 동일한 id를 가진 주문을 새 응답으로 교체
        state.currentOrders = state.currentOrders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      
        // 2) 상세(selectedOrder)을 보고 있다면 동일한 주문이면 교체
        if (state.selectedOrder?._id === action.payload._id) {
          state.selectedOrder = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
      

  },
});

export const { clearOrders } = riderOrderSlice.actions;
export default riderOrderSlice.reducer;
