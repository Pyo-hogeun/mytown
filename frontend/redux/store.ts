// 🧠 Redux 스토어 설정
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import storeReducer from './slices/storeSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer, // 🔐 인증 관련 상태 슬라이스
    product: productReducer,
    store: storeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
