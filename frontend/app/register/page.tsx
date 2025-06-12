// pages/register.tsx

import { useState } from 'react';
import styled from 'styled-components';
import axios from '@/utils/axiosInstance';
import { useRouter } from 'next/router';

// 📌 스타일 정의
const Container = styled.div`
  max-width: 400px;
  margin: 80px auto;
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 12px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-top: 12px;
  font-size: 16px;
`;

const Button = styled.button`
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  font-weight: bold;
  background-color: #1e90ff;
  color: white;
  border: none;
  border-radius: 8px;
`;

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // 📌 회원가입 요청
  const handleRegister = async () => {
    try {
      await axios.post('/auth/register', { name, email, password });
      alert('회원가입 성공');
      router.push('/login'); // 로그인 페이지로 이동
    } catch (error: any) {
      alert(error.response?.data?.message || '회원가입 실패');
    }
  };

  return (
    <Container>
      <h2>회원가입</h2>
      <Input placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={handleRegister}>회원가입</Button>
    </Container>
  );
}
