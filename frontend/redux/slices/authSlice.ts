// 🔐 인증 상태 (토큰 저장 및 삭제) 관리
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
}

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload); // 🌍 로컬 저장
    },
    clearToken: (state) => {
      state.token = null;
      localStorage.removeItem('token'); // ❌ 토큰 삭제
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
