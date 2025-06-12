'use client';
// 🔐 로그인 페이지: 입력 → 로그인 요청 → 토큰 저장
import { useDispatch } from 'react-redux';
import { setToken } from '@/redux/slices/authSlice';
import { login } from '@/services/authService';
import { useState } from 'react';

export default function LoginPage() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const token = await login({ email, password });
      dispatch(setToken(token)); // 🔐 Redux + LocalStorage에 저장
      alert('로그인 성공');
    } catch (err) {
      alert('로그인 실패');
    }
  };

  return (
    <div>
      <h1>로그인</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
      <button onClick={handleLogin}>로그인</button>
    </div>
  );
}
