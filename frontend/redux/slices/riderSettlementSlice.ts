// redux/slices/riderSettlementSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/utils/axiosInstance";

export interface Settlement {
  _id: string;
  rider: {
    _id: string;
    name: string;
  };
  weekStart: string;
  weekEnd: string;
  totalLength: number;
  commission: number;
  status: "pending" | "paid";
}

interface SettlementState {
  items: Settlement[];
  loading: boolean;
  error: string | null;
}

const initialState: SettlementState = {
  items: [],
  loading: false,
  error: null,
};

// ✅ 라이더 정산 내역 불러오기
export const fetchRiderSettlements = createAsyncThunk(
  "settlement/fetchRider",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/settlement/rider");
      return res.data.settlements as Settlement[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "정산 내역 조회 실패");
    }
  }
);
// ✅ 관리자용 정산내역 조회
export const fetchManageSettlements = createAsyncThunk(
  "settlement/fetchManage",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/settlement/manage");
      return res.data.settlements as Settlement[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "정산 내역 조회 실패");
    }
  }
);

// ✅ 특정 정산 지급 완료 처리 (관리자 전용)
export const paySettlement = createAsyncThunk(
  "settlement/pay",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`/settlement/${id}/pay`);
      return res.data.settlement as Settlement;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "정산 지급 처리 실패");
    }
  }
);


const riderSettlementSlice = createSlice({
  name: "riderSettlement",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRiderSettlements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRiderSettlements.fulfilled, (state, action: PayloadAction<Settlement[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRiderSettlements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchManageSettlements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManageSettlements.fulfilled, (state, action: PayloadAction<Settlement[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchManageSettlements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(paySettlement.fulfilled, (state, action: PayloadAction<Settlement>) => {
        // settlement 상태 업데이트
        const idx = state.items.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      .addCase(paySettlement.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default riderSettlementSlice.reducer;
