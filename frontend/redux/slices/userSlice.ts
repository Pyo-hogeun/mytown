// redux/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/utils/axiosInstance";

export interface User {
  _id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  role: "user" | "admin" | "master" | "manager" | "rider";
  createdAt: string;
}

interface UserState {
  list: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  list: [],
  loading: false,
  error: null,
};

// 🔎 필터링 가능한 thunk
export const fetchUsers = createAsyncThunk<
  User[], // 성공 시 반환 타입
  { name?: string; email?: string; role?: string; phone?: string; address?: string } | undefined
>("users/fetchUsers", async (filters) => {
  const res = await axios.get<User[]>("/users", {
    params: filters, // ✅ 쿼리 파라미터 전달
  });
  return res.data;
});

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "사용자 목록 불러오기 실패";
      });
  },
});

export default userSlice.reducer;
