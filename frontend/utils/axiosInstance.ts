// 🌐 Axios 인스턴스: 모든 요청에 자동으로 토큰 포함
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5001/api', // 🌍 백엔드 API 주소
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
