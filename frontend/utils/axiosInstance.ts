// 🌐 Axios 인스턴스: 모든 요청에 자동으로 토큰 포함
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const DEFAULT_PROD_API_BASE_URL = 'https://mytown-myui.onrender.com/api';

const normalizeApiBaseUrl = (url?: string) => {
  if (!url) return undefined;
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return undefined;
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

// ✅ 환경변수 우선, 개발/프로덕션 URL 자동 선택 후 필요 시 fallback
const resolveApiBaseUrl = () => {
  const envBaseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
  if (envBaseUrl) {
    return envBaseUrl;
  }

  const devBaseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL_DEV);
  const prodBaseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL_PROD);

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
    return prodBaseUrl || devBaseUrl || DEFAULT_PROD_API_BASE_URL;
  }

  return normalizeApiBaseUrl(`${origin}/api`) || DEFAULT_PROD_API_BASE_URL;
};



const RETRYABLE_PATHS = new Set(['/auth/login']);

const isIosWebView = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  return /iPhone|iPad|iPod/i.test(ua) && /AppleWebKit/i.test(ua);
};

const shouldRetryNetworkError = (error: AxiosError) => {
  const code = error.code || '';
  const config = error.config as (InternalAxiosRequestConfig & { _retryCount?: number }) | undefined;
  const url = config?.url || '';

  if (!config) return false;
  if (!isIosWebView()) return false;
  if (code !== 'ERR_NETWORK') return false;
  if (!RETRYABLE_PATHS.has(url)) return false;

  const retryCount = config._retryCount || 0;
  return retryCount < 1;
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



instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!shouldRetryNetworkError(error)) {
      return Promise.reject(error);
    }

    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
    config._retryCount = (config._retryCount || 0) + 1;

    await new Promise((resolve) => setTimeout(resolve, 350));
    return instance.request(config);
  },
);


export default instance;
