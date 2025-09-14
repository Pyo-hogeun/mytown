// 파일: redux/slices/cartSlice.ts
// 설명: 장바구니 상태를 관리하는 Redux slice
// - 서버 API 연동: fetchCart, addToCart, checkout
// - 로컬 상태에도 장바구니 유지

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/utils/axiosInstance";

export interface CartItem {
  productId: string;
  optionId?: string | null;
  quantity: number;
  price: number;
  name: string;
  imageUrl?: string;
  storeName?: string;
  maxStock?: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
}

const initialState: CartState = {
  items: [],
  loading: false,
};

// 장바구니 불러오기
export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const res = await axios.get("/cart");
  return res.data;
});

// 장바구니에 상품 추가
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, optionId, quantity }: CartItem) => {
    const res = await axios.post("/cart/add", { productId, optionId, quantity: quantity || 1 });
    return res.data;
  }
);

// ✅ 주문 생성 & 장바구니 비우기
export const checkout = createAsyncThunk(
  "cart/checkout",
  async (items: CartItem[], { dispatch }) => {
    const res = await axios.post("/order/checkout", { items });
    dispatch(updateCart(res.data.cart));
    return res.data.order;
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    updateCart: (state, action: PayloadAction<{ items: CartItem[] }>) => {
      state.items = action.payload.items;
    },
    removeFromCart: (state, action: PayloadAction<{ productId: string; optionId?: string | null }>) => {
      state.items = state.items.filter(
        (i) => !(i.productId === action.payload.productId && i.optionId === action.payload.optionId)
      );
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.loading = false;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
      });
  },
});

export const { updateCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;