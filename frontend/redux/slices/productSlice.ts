import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ProductStatus = 'draft' | 'published' | 'hidden';

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
  reviews?: Review[];
  status: ProductStatus; // ✅ 상품 노출 상태 필드 추가
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
      // ✅ 서버에서 안넘겨줄 경우 draft 기본값 강제
      state.items = action.payload.map((p) => ({
        ...p,
        status: p.status ?? 'draft',
      }));
    },
    addProduct(state, action: PayloadAction<Product>) {
      // ✅ 신규 추가 시 항상 draft 상태로 저장
      state.items.push({
        ...action.payload,
        status: 'draft',
      });
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const index = state.items.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = {
          ...action.payload,
          status: action.payload.status ?? 'draft',
        };
      }
    },
  },
});

export const { setProducts, addProduct, updateProduct } = productSlice.actions;
export default productSlice.reducer;
