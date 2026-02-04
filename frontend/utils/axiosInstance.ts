// 🌐 Axios 인스턴스: 모든 요청에 자동으로 토큰 포함
import axios from 'axios';
// ✅ 환경변수 우선, 개발/프로덕션 URL 자동 선택 후 필요 시 fallback
const resolveApiBaseUrl = () => {
  const envBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envBaseUrl) {
    return envBaseUrl;
  }

  const devBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEV;
  const prodBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_PROD;

  if (process.env.NODE_ENV === 'production') {
    if (prodBaseUrl) {
      return prodBaseUrl;
    }
  } else if (devBaseUrl) {
    return devBaseUrl;
  }

  if (typeof window === 'undefined') {
    return undefined;
  }

  const origin = window.location.origin;
  const isNativeOrigin = ['capacitor://', 'ionic://', 'file://'].some((scheme) =>
    origin.startsWith(scheme),
  );
  if (isNativeOrigin) {
    return prodBaseUrl || devBaseUrl;
  }

  return `${origin}/api`;
};

const API_BASE_URL = resolveApiBaseUrl();
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
