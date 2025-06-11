import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Product = {
  _id: string;
  name: string;
  price: number;
  storeName: string;
};

interface ProductState {
  items: Product[];
}

const initialState: ProductState = {
  items: [],
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      state.items = action.payload;
    },
  },
});

export const { setProducts } = productSlice.actions;
export default productSlice.reducer;
