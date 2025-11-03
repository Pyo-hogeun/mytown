// 🔐 인증 상태 (토큰 + 사용자 정보) 관리
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Store } from './storeSlice';
import axios from '@/utils/axiosInstance';

export interface RiderInfo {
  deliveryArea: string; // 예: '강남구 역삼동'
  settlementAccount: {
    bankName: string;
    accountNumber: string;
    verified: boolean;
  };
  vehicleType: 'motorcycle' | 'car';
}
export interface SavedDeliveryInfo {
  receiver?: string;
  phone?: string;
  address?: string;
  detailAddress?: string;
  updatedAt?: string;
}
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user' | 'manager' | 'master' | 'rider' | null;
  email: string;
  store?: Store;
  phone?: string;
  savedDeliveryInfo?: SavedDeliveryInfo | null;
  riderInfo?: RiderInfo | null; // ✅ 라이더 정보 포함 (선택적)
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
}

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || 'null')
    : null,
  loading: false,
};
// ✅ 현재 로그인 사용자 정보 재요청
export const fetchCurrentUser = createAsyncThunk("auth/fetchCurrentUser", async () => {
  const res = await axios.get("/auth/me");
  return res.data; // 백엔드에서 user 정보 반환하도록 구현되어 있어야 함
});
// ✅ 유저 배송지 조회
export const fetchSavedDeliveryInfo = createAsyncThunk(
  "order/fetchSavedDeliveryInfo",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/users/me/delivery-info");
      return res.data.deliveryInfo;
    } catch (err: any) {
      return thunkAPI.rejectWithValue("배송지 조회 실패");
    }
  }
);

// ✅ 유저 배송지 저장
export const saveDeliveryInfoToUser = createAsyncThunk(
  "order/saveDeliveryInfoToUser",
  async (
    { receiver, phone, address, detailAddress }: { receiver: string; phone: string; address: string; detailAddress: string; },
    thunkAPI
  ) => {
    try {
      const res = await axios.post("/users/me/delivery-info", { receiver, phone, address, detailAddress });
      return res.data.deliveryInfo;
    } catch (err: any) {
      return thunkAPI.rejectWithValue("배송지 저장 실패");
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    clearToken: (state) => {
      state.token = null;
      localStorage.removeItem('token');
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    clearUser: (state) => {
      state.user = null;
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
      })
      // ✅ 배송지 조회 성공 시 user.savedDeliveryInfo 갱신
      .addCase(fetchSavedDeliveryInfo.fulfilled, (state, action) => {
        if (!state.user) return;
        state.user.savedDeliveryInfo = {
          receiver: action.payload?.receiver || '',
          phone: action.payload?.phone || '',
          address: action.payload?.address || '',
          detailAddress: action.payload?.detailAddress || '',
          updatedAt: action.payload?.updatedAt || undefined,
        };
      })
      // ✅ 배송지 저장 성공 시 user.savedDeliveryInfo 갱신
      .addCase(saveDeliveryInfoToUser.fulfilled, (state, action) => {
        if (!state.user) return;
        state.user.savedDeliveryInfo = {
          receiver: action.payload?.receiver || '',
          phone: action.payload?.phone || '',
          address: action.payload?.address || '',
          detailAddress: action.payload?.detailAddress || '',
          updatedAt: action.payload?.updatedAt || new Date().toISOString(),
        };
      });
  },
});

export const { setToken, clearToken, setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
