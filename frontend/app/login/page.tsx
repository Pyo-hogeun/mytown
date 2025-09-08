'use client';

import { useDispatch } from 'react-redux';
import { setToken, setUser } from '@/redux/slices/authSlice';
import { login } from '@/services/authService';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import Input from '../component/Input';

// 🔄 로딩 스피너 애니메이션
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Container = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: #f5f6f8;
  z-index: -1;
`;

const Card = styled.div`
  background: #fff;
  padding: 40px 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 24px;
  text-align: center;
  color: #333;
`;

const Button = styled.button<{ loading?: boolean }>`
  width: 100%;
  padding: 12px 14px;
  background: ${({ loading }) => (loading ? '#ccc' : '#0070f3')};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: ${({ loading }) => (loading ? 'not-allowed' : 'pointer')};
  position: relative;

  &:hover {
    background: ${({ loading }) => (loading ? '#ccc' : '#005bb5')};
  }
`;

const Spinner = styled.div`
  border: 2px solid #fff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: ${spin} 0.6s linear infinite;
  position: absolute;
  left: calc(50% - 8px);
  top: calc(50% - 8px);
`;

const LoginPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ 클라이언트 렌더링 후 localStorage에서 토큰 초기화
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      dispatch(setToken(savedToken));
      // 필요 시 유저 정보도 가져와서 dispatch
    }
  }, [dispatch]);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const data = await login({ email, password });
      console.log("로그인 성공:", data);

      // ✅ localStorage는 클라이언트 환경에서만 접근
      if (typeof window !== 'undefined') {
        localStorage.setItem("token", data.token);
      }

      dispatch(setUser(data.user));
      dispatch(setToken(data.token));

      router.push('/products');
    } catch (err) {
      console.error("로그인 실패:", err);
      alert("로그인 실패! 이메일/비밀번호를 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>로그인</Title>
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleLogin} loading={loading} disabled={loading}>
          {loading ? <Spinner /> : "로그인"}
        </Button>
      </Card>
    </Container>
  );
};

export default LoginPage;
