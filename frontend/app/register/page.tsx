'use client'; // 👈 필수!

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from '@/utils/axiosInstance';
import { useRouter } from 'next/navigation';

// 📌 스타일 정의
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

// 입력창
const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  &:focus {
    border-color: #0070f3;
  }
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
// 카드 UI
const Card = styled.div`
  background: #fff;
  padding: 40px 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 400px;
`;

// 🔄 로딩 스피너 애니메이션
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
// 로딩 아이콘
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
export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleTemp, setRoleTemp] = useState('');
  const router = useRouter();

  // 📌 회원가입 요청
  const handleRegister = async () => {
    try {
      await axios.post('/auth/register', { name, email, password, roleTemp });
      alert('회원가입 성공');
      router.push('/login'); // 로그인 페이지로 이동
    } catch (error: any) {
      alert(error.response?.data?.message || '회원가입 실패');
    }
  };

  return (
    <Container>
      <Card>
        <h2>회원가입</h2>
        <Input placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={handleRegister}>회원가입</Button>
        {/* 임시 */}
        <br />
        <br />
        <select
          name=""
          id=""
          value={roleTemp}
          onChange={(e)=>setRoleTemp(e.target.value)}
        >
          <option value="admin">admin</option>
          <option value="master">master</option>
          <option value="user">user</option>
          <option value="manager">manager</option>
          <option value="rider">rider</option>
        </select>
      </Card>
    </Container>
  );
}
