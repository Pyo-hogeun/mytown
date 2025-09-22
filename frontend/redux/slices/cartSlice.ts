// 파일: redux/slices/cartSlice.ts
// 설명: 장바구니 상태를 관리하는 Redux slice
// - 서버 API 연동: fetchCart, addToCart, checkout
// - 로컬 상태에도 장바구니 유지

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/utils/axiosInstance";

export interface CartItem {
  _id: string; // cart item id
  product: {
    _id: string;
    name: string;
    price: number;
    imageUrl?: string;
    store?: { _id: string; name: string };
  };
  option?: {
    _id: string;
    name: string;
    extraPrice: number;
  } | null;
  quantity: number;
  optionId?: string;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
}

const initialState: CartState = {
  items: [],
  loading: false,
};

// 서버 응답을 CartItem 형태로 매핑하는 유틸
const mapCartItems = (items: any[]): CartItem[] => {
  return items.map((i) => ({
    _id: i._id,
    quantity: i.quantity,
    product: typeof i.product === "string" ? { _id: i.product, name: "", price: 0 } : i.product,
    optionId: i.optionId? i.optionId: null,
  }));
};

// 장바구니 불러오기
export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const res = await axios.get("/cart");
  return res.data; // { items: CartItem[] }
});

// ✅ 장바구니에 상품 추가
export const addToCart = createAsyncThunk<
  CartItem[],
  {
    productId: string;
    optionId?: string;
    storeId?: string;
    quantity: number;
    price: number;
    name: string;
    imageUrl: string;
    storeName: string;
  }
>("cart/addToCart", async ({ productId, optionId, quantity }) => {
  const res = await axios.post("/cart/add", { productId, optionId, quantity });
  return res.data.items as CartItem[];
});
// 장바구니에서 상품 제거
export const deleteFromCart = createAsyncThunk(
  "cart/deleteFromCart",
  async (itemId: string) => {
    const res = await axios.delete(`/cart/remove/${itemId}`);
    return { items: mapCartItems(res.data.items) }; // { items: CartItem[] }
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
        (i) => !(i.product._id === action.payload.productId && (i.option?._id ?? null) === (action.payload.optionId ?? null))
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
        state.items = action.payload;
      })
      .addCase(deleteFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
      });
  },
});

export const { updateCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;