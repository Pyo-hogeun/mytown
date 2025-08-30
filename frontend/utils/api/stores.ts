// utils/api/stores.ts
import axios from '@/utils/axiosInstance';

export interface Store {
  _id: string;
  name: string;
  address: string;
  phone: string;
  createdAt: string;
}

export const fetchStores = async (): Promise<Store[]> => {
  const res = await axios.get('/stores');
  return res.data; // 서버에서 배열을 반환한다고 가정
};
