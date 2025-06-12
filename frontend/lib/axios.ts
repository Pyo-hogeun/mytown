// lib/axios.ts
// axios 인스턴스를 생성하여 API 기본 경로를 설정합니다.

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // 백엔드 서버 주소 (필요에 따라 수정)
  withCredentials: true, // 쿠키 인증 등 필요한 경우
});

export default api;
