import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/utils/axiosInstance";

export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const res = await axios.get("/cart");
  return res.data;
});

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity }: { productId: string; quantity?: number }) => {
    const res = await axios.post("/cart/add", { productId, quantity: quantity || 1 });
    return res.data;
  }
);

// ✅ 주문 생성 & 장바구니 업데이트
export const checkout = createAsyncThunk(
  'cart/checkout',
  async (items, { dispatch }) => {
    const res = await axios.post('/order/checkout', { items });
    // 최신 cart 상태 반영
    dispatch(updateCart(res.data.cart));
    return res.data.order;
  }
);
const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], loading: false },
  reducers: {
    updateCart: (state, action) => {
      state.items = action.payload.items;
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
export const { updateCart } = cartSlice.actions;
export default cartSlice.reducer;
