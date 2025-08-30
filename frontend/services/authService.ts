// 📦 로그인 요청 함수
import axios from '../utils/axiosInstance';
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'admin' | 'user';
    name: string;
    // 필요한 필드 더 추가
  };
  // 다른 서버 응답 필드들...
}
export interface LoginParams {
  email: string;
  password: string;
}

export const login = async (params: LoginParams): Promise<LoginResponse> => {
  const res = await axios.post<LoginResponse>('/auth/login', params);
  console.log('log res: ', res.data);
  return res.data; // 📥 response 전체 반환
};
