// redux/slices/productSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from '@/utils/axiosInstance';

// ✅ 타입 정의
export type ProductStatus = 'draft' | 'published' | 'hidden';

export type Option = {
  _id?: string;
  name: string;
  extraPrice?: number;
  stock?: number;
};

export type Review = {
  _id?: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt?: string;
};

export type Product = {
  _id: string;
  name: string;
  price: number;
  storeName: string;
  storeId: string;
  stockQty: number;
  imageUrl?: string;
  images?: string[];
  options?: Option[];
  description?: string;
  reviews?: Review[];
  status: ProductStatus;
};

// ✅ 상태 타입
interface ProductState {
  items: Product[];          // 전체 상품 목록
  selected?: Product | null; // 단건 상세조회용 상태
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
};

// ✅ 상품 상세조회 thunk
export const fetchProductById = createAsyncThunk(
  'product/fetchById',
  async (productId: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/products/${productId}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || '상품 불러오기 실패');
    }
  }
);

// ✅ slice 정의
const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      state.items = action.payload.map((p) => ({
        ...p,
        status: p.status ?? 'draft',
      }));
    },
    addProduct(state, action: PayloadAction<Product>) {
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
    clearProduct: (state) => {
      state.selected = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selected = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        // 서버가 status 안보내면 draft로 기본 설정
        state.selected = { ...action.payload, status: action.payload.status ?? 'draft' };
      })
      .addCase(fetchProductById.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.selected = null;
      });
  },
});

// ✅ 액션 export
export const { setProducts, addProduct, updateProduct, clearProduct } = productSlice.actions;
export default productSlice.reducer;
