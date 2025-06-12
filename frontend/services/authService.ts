// 📦 로그인 요청 함수
import axios from '../utils/axiosInstance';

interface LoginParams {
  email: string;
  password: string;
}

export const login = async (params: LoginParams): Promise<string> => {
  const res = await axios.post('/auth/login', params);
  return res.data.token; // 📥 토큰 반환
};
