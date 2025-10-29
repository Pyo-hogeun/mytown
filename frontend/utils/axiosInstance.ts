// 🌐 Axios 인스턴스: 모든 요청에 자동으로 토큰 포함
import axios from 'axios';
// ✅ 환경변수에서 API URL을 불러옴
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const instance = axios.create({
  baseURL: API_BASE_URL, // 🌍 백엔드 API 주소
});

instance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 🔑 인증 헤더 자동 추가
    }
  }
  return config;
});

export default instance;
