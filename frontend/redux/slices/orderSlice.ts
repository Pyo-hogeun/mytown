// redux/slices/orderSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/utils/axiosInstance";

export interface OrderItemPayload {
  _id: string; // cart item id
  product: { _id: string; name: string; price: number };
  quantity: number;
}

export type PaymentMethod = "card" | "kakao" | "naver";

// ✅ 결제 직후 서버가 돌려주는 "생성된 주문 요약" (여러 가맹점 건)
export interface CreatedOrder {
  orderId: string;
  store?: string;
  totalPrice?: number;
}

// ✅ 주문 목록/상세에서 사용하는 "실제 주문 문서" 타입
export type OrderStatus = "pending" | "accepted" | "delivering" | "completed" | "cancelled";

export interface StoreOrderItem {
  // 백엔드 구현 편차 대응: productName 또는 product 객체/ID가 올 수 있음
  product?: string | { _id: string; name?: string; price?: number };
  productName?: string;
  price: number;
  quantity: number;
}

export interface StoreOrder {
  _id?: string;
  store?: string | { _id: string; name?: string };
  items: StoreOrderItem[];
}

export interface UserOrder {
  _id: string;
  paymentMethod?: PaymentMethod | string;
  status?: OrderStatus;
  createdAt: string;
  // 백엔드에 따라 필드명이 다를 수 있어 둘 다 지원
  totalAmount?: number;
  totalPrice?: number;
  storeOrders: StoreOrder[];
}

// ✅ 주문 생성 (여러 가맹점 주문 생성)
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (payload: {
    items: OrderItemPayload[];
    paymentMethod: PaymentMethod;
    maskedCard?: string;
  }) => {
    const res = await axios.post("/order", {
      items: payload.items,
      paymentMethod: payload.paymentMethod,
    });

    // 서버 응답: { orders: [{ orderId, store, totalPrice } ...] }
    return {
      orders: res.data.orders as CreatedOrder[],
      paymentMethod: payload.paymentMethod,
      maskedCard: payload.maskedCard,
    };
  }
);

// ✅ 로그인 사용자의 전체 주문 목록 조회
export const fetchOrders = createAsyncThunk("order/fetchOrders", async () => {
  // 서버 응답: { orders: UserOrder[] } 형태로 가정
  const res = await axios.get("/order");
  return res.data.orders as UserOrder[];
});

// ✅ 특정 주문 상세 조회
export const fetchOrderById = createAsyncThunk(
  "order/fetchOrderById",
  async (orderId: string) => {
    const res = await axios.get(`/order/${orderId}`);
    return res.data as UserOrder;
  }
);

interface OrderState {
  status: "idle" | "processing" | "succeeded" | "failed";
  error?: string | null;

  // 최근 결제 결과(여러 주문 가능)
  lastOrders: CreatedOrder[];
  lastPaymentMethod?: PaymentMethod | null;
  maskedCard?: string | null;

  // 목록/상세 조회용
  orders: UserOrder[];
  selectedOrder?: UserOrder;
}

const initialState: OrderState = {
  status: "idle",
  error: null,

  lastOrders: [],
  lastPaymentMethod: null,
  maskedCard: null,

  orders: [],
  selectedOrder: undefined,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.status = "idle";
      state.error = null;

      state.lastOrders = [];
      state.lastPaymentMethod = null;
      state.maskedCard = null;

      state.orders = [];
      state.selectedOrder = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // 주문 생성
      .addCase(createOrder.pending, (state) => {
        state.status = "processing";
        state.error = null;
      })
      .addCase(
        createOrder.fulfilled,
        (
          state,
          action: PayloadAction<{
            orders: CreatedOrder[];
            paymentMethod: PaymentMethod;
            maskedCard?: string;
          }>
        ) => {
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

      // 주문 목록 조회
      .addCase(fetchOrders.pending, (state) => {
        state.status = "processing";
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<UserOrder[]>) => {
        state.status = "succeeded";
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message || "주문 조회 실패";
      })

      // 주문 상세 조회
      .addCase(fetchOrderById.pending, (state) => {
        state.status = "processing";
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<UserOrder>) => {
        state.status = "succeeded";
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message || "주문 상세 조회 실패";
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
