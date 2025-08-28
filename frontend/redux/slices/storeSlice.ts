import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Store = {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
};

interface StoreState {
  items: Store[];
}

const initialState: StoreState = {
  items: [],
};

const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    setStores(state, action: PayloadAction<Store[]>) {
      state.items = action.payload;
    },
  },
});

export const { setStores } = storeSlice.actions;
export default storeSlice.reducer;
