import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/utils/axiosInstance";

export interface OrderItemPayload {
  _id: string;
  product: { _id: string; name: string; price: number };
  quantity: number;
}

export type PaymentMethod = "card" | "kakao" | "naver";
export type OrderStatus = "pending" | "accepted" | "delivering" | "completed" | "cancelled";
// ✅ 모든 주문 상태값 배열 (드롭다운 등에서 사용)
export const validStatuses: OrderStatus[] = [
  "pending",
  "accepted",
  "delivering",
  "completed",
  "cancelled",
];
export interface DeliveryTime {
  day: string;
  time: string;
}

export interface CreateOrderPayload {
  items: OrderItemPayload[];
  paymentMethod: PaymentMethod;
  receiver: string;
  phone: string;
  address: string;
  deliveryTime?: DeliveryTime;
  maskedCard?: string;
}

export interface CreatedOrder {
  orderId: string;
  store?: string;
  totalPrice?: number;
  receiver?: string;
  phone?: string;
  address?: string;
  deliveryTime?: DeliveryTime;
}

export interface UserOrder {
  paymentMethod: string;
  _id: string;
  user?: { _id: string; name?: string; email?:string };
  store?: string | { _id: string; name?: string };
  orderItems: {
    product: string | { _id: string; name?: string; price?: number };
    quantity: number;
    unitPrice: number;
  }[];
  status?: OrderStatus;
  createdAt: string;
  totalPrice?: number;
  receiver: string;
  phone: string;
  address: string;
  deliveryTime?: DeliveryTime;
}

export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (payload: CreateOrderPayload) => {
    const res = await axios.post("/order", payload);
    return {
      orders: res.data.orders as CreatedOrder[],
      paymentMethod: payload.paymentMethod,
      maskedCard: payload.maskedCard,
    };
  }
);

export const fetchOrders = createAsyncThunk("order/fetchOrders", async () => {
  const res = await axios.get("/order");
  return res.data.orders as UserOrder[];
});

export const fetchOrderById = createAsyncThunk(
  "order/fetchOrderById",
  async (orderId: string) => {
    const res = await axios.get(`/order/${orderId}`);
    return res.data as UserOrder;
  }
);

// 주문 취소
export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async (orderId: string) => {
    const res = await axios.patch(`/order/${orderId}/cancel`);
    return res.data; // { success: true, order: ... }
  }
);

// 매니저 주문 조회
export const fetchManagerOrders = createAsyncThunk(
  "order/fetchManagerOrders",
  async () => {
    const res = await axios.get("/order/manager");
    return res.data.orders as UserOrder[];
  }
);

// 주문 상태 변경
export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
    const res = await axios.patch(`/order/${orderId}/status`, { status });
    return res.data.order as UserOrder;
  }
);

interface OrderState {
  status: "idle" | "processing" | "succeeded" | "failed";
  error?: string | null;

  lastOrders: CreatedOrder[];
  lastPaymentMethod?: PaymentMethod | null;
  maskedCard?: string | null;

  orders: UserOrder[];
  selectedOrder?: UserOrder;

  // ✅ 배송 관련 상태
  receiver: string;
  phone: string;
  address: string;
  deliveryTime?: DeliveryTime;
}

const initialState: OrderState = {
  status: "idle",
  error: null,
  lastOrders: [],
  lastPaymentMethod: null,
  maskedCard: null,
  orders: [],
  selectedOrder: undefined,
  receiver: "",
  phone: "",
  address: "",
  deliveryTime: undefined,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    resetOrderState: (state) => {
      Object.assign(state, initialState);
    },
    setReceiver: (state, action: PayloadAction<string>) => {
      state.receiver = action.payload;
    },
    setPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
    setDeliveryTime: (state, action: PayloadAction<DeliveryTime>) => {
      state.deliveryTime = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.status = "processing";
        state.error = null;
      })
      .addCase(
        createOrder.fulfilled,
        (state, action: PayloadAction<{ orders: CreatedOrder[]; paymentMethod: PaymentMethod; maskedCard?: string }>) => {
          state.status = "succeeded";
          state.lastOrders = action.payload.orders;
          state.lastPaymentMethod = action.payload.paymentMethod;
          state.maskedCard = action.payload.maskedCard ?? null;
        }
      )
      .addCase(createOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message || "결제/주문 실패";
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<UserOrder[]>) => {
        state.status = "succeeded";
        state.orders = action.payload;
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<UserOrder>) => {
        state.status = "succeeded";
        state.selectedOrder = action.payload;
      })
      .addCase(cancelOrder.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = "succeeded";
        // 해당 주문 상태를 cancelled 로 업데이트
        const updated = action.payload.order;
        state.orders = state.orders.map((o) =>
          o._id === updated._id ? updated : o
        );
      })
      .addCase(fetchManagerOrders.fulfilled, (state, action: PayloadAction<UserOrder[]>) => {
        state.status = "succeeded";
        state.orders = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<UserOrder>) => {
        // ✅ 변경된 주문을 state.orders에 반영
        const idx = state.orders.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) {
          state.orders[idx] = action.payload;
        }
        if (state.selectedOrder?._id === action.payload._id) {
          state.selectedOrder = action.payload;
        }
      });
  },
});

export const { resetOrderState, setReceiver, setPhone, setAddress, setDeliveryTime } = orderSlice.actions;
export default orderSlice.reducer;
