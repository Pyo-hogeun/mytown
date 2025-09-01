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

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], loading: false },
  reducers: {},
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

export default cartSlice.reducer;
