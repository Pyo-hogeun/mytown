import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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

export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const res = await axios.get<User[]>("/users");
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
      .addCase(fetchUsers.fulfilled, (state, action) => {
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
