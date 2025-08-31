'use client';
// 🔐 로그인 페이지: 입력 → 로그인 요청 → 토큰 저장
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '@/redux/slices/authSlice';
import { login } from '@/services/authService';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const data = await login({ email, password });
      console.log("로그인 성공:", data);

      // 예시: 토큰 저장
      localStorage.setItem("token", data.token);

      // 예시: 유저 정보 상태에 저장
      dispatch(setUser(data.user));
      dispatch(setToken(data.token));

      router.push('/products')


    } catch (err) {
      console.error("로그인 실패:", err);
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
