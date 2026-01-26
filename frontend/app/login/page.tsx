'use client';

import { useDispatch } from 'react-redux';
import { setToken, setUser } from '@/redux/slices/authSlice';
import { login } from '@/services/authService';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import Input from '../component/Input';
// import { RootState } from '@/redux/store';
import KakaoLoginButton from '../component/KakaoLoginButton';

// 🔄 로딩 스피너 애니메이션
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  height: 50vh;
  width: 100vw;
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
  height: 43px;

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

const DevFloatingMenu = styled.div`
  position: fixed;
  right: 24px;
  bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  z-index: 10;
`;

const DevFloatingButton = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: #111827;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(17, 24, 39, 0.2);
`;

const DevMenu = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  width: 260px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DevMenuTitle = styled.p`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px;
  color: #111827;
`;

const DevMenuItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  cursor: pointer;
  text-align: left;

  strong {
    font-size: 13px;
    color: #111827;
  }

  span {
    font-size: 12px;
    color: #6b7280;
  }

  &:hover {
    border-color: #cbd5f5;
    background: #eef2ff;
  }
`;

const LoginPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  // const user = useSelector((state: RootState) => state.auth.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDevMenuOpen, setIsDevMenuOpen] = useState(false);
  const isDev = process.env.NODE_ENV !== 'production';

  const devAccounts = [
    { label: 'Admin', email: 'admin01@gmail.com', password: '1234' },
    { label: 'User 01', email: 'user01@gmail.com', password: '1234' },
    { label: 'User 02', email: 'user02@gmail.com', password: '1234' },
    { label: 'Manager 01', email: 'manager01@gmail.com', password: '1234' },
    { label: 'Manager 02', email: 'manager02@gmail.com', password: '1234' },
    { label: '새마을 Manager', email: 'manager04@gmail.com', password: '1234' },
    { label: 'Rider 01', email: 'rider01@gmail.com', password: '1234' },
    { label: 'Rider 02', email: 'rider02@gmail.com', password: '1234' },
  ];

  // ✅ 클라이언트 렌더링 후 localStorage에서 토큰 초기화
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      dispatch(setToken(savedToken));
      // 필요 시 유저 정보도 가져와서 dispatch
    }
  }, [dispatch]);

  const loginWithCredentials = async (loginEmail: string, loginPassword: string) => {
    if (loading) return;
    setLoading(true);

    try {
      const data = await login({ email: loginEmail, password: loginPassword });
      // console.log("로그인 성공:", data);

      // ✅ localStorage는 클라이언트 환경에서만 접근
      if (typeof window !== 'undefined') {
        localStorage.setItem("token", data.token);
      }

      dispatch(setUser(data.user));
      dispatch(setToken(data.token));

      // console.log('user', user?.role);

      if (data.user.role === 'rider') {
        router.push('/rider');
      } else {

        router.push('/products');
      }

    } catch (err) {
      console.error("로그인 실패:", err);
      alert("로그인 실패! 이메일/비밀번호를 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    await loginWithCredentials(email, password);
  };

  const handleQuickLogin = async (loginEmail: string, loginPassword: string) => {
    setEmail(loginEmail);
    setPassword(loginPassword);
    await loginWithCredentials(loginEmail, loginPassword);
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
        <hr />
        <KakaoLoginButton />
      </Card>
      {isDev && (
        <DevFloatingMenu>
          {isDevMenuOpen && (
            <DevMenu>
              <DevMenuTitle>개발용 계정 전환</DevMenuTitle>
              {devAccounts.map((account) => (
                <DevMenuItem
                  key={account.email}
                  type="button"
                  onClick={() => handleQuickLogin(account.email, account.password)}
                >
                  <strong>{account.label}</strong>
                  <span>{account.email}</span>
                </DevMenuItem>
              ))}
            </DevMenu>
          )}
          <DevFloatingButton
            type="button"
            aria-label="개발용 계정 전환 메뉴"
            onClick={() => setIsDevMenuOpen((prev) => !prev)}
          >
            DEV
          </DevFloatingButton>
        </DevFloatingMenu>
      )}
    </Container>
  );
};

export default LoginPage;
