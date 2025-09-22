import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Product = {
  _id: string;
  name: string;
  price: number;
  storeName: string;
  storeId : string;
  stockQty: number;
  imageUrl?: string;
  images?: string[];
  options?: Option[];
  description?: string;
  reviews?: Review[]
};

export type Option = {
  _id?: string;
  name: string;
  extraPrice?: number;
  stock?: number
};

export type Review = {
  _id?: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt?: string
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
