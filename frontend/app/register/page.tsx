'use client';

import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from '@/utils/axiosInstance';
import { useRouter } from 'next/navigation';
import Input from '../component/Input';

// 📌 스타일 정의
const Container = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  min-height: 100vh;
  width: 100vw;
  background: #f5f6f8;
  z-index: -1;
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

const Card = styled.div`
  background: #fff;
  padding: 40px 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 400px;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
const Select = styled.select`
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
const Label = styled.label`
  display: block;
  margin-bottom: 10px;
`
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

// 📌 마트 타입
interface Store {
  _id: string;
  name: string;
  address: string;
  phone: string;
  owner: string;
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleTemp, setRoleTemp] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState('');
  const router = useRouter();

  // 📌 manager 선택 시 마트 목록 불러오기
  useEffect(() => {
    const fetchStores = async () => {
      if (roleTemp === 'manager') {
        try {
          const res = await axios.get('/stores');
          setStores(res.data);
        } catch (err) {
          console.error('마트 목록 불러오기 실패:', err);
        }
      }
    };
    fetchStores();
  }, [roleTemp]);

  // 📌 회원가입 요청
  const handleRegister = async () => {
    try {
      await axios.post('/auth/register', {
        name,
        email,
        password,
        roleTemp,
        storeId: roleTemp === 'manager' ? selectedStore : undefined,
      });
      alert('회원가입 성공');
      router.push('/login');
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

        {/* role 선택 */}
        <Select
          name="roleSelect"
          value={roleTemp}
          onChange={(e) => setRoleTemp(e.target.value)}
        >
          <option value="">-- 역할 선택 --</option>
          <option value="admin">admin</option>
          <option value="master">master</option>
          <option value="user">user</option>
          <option value="manager">manager</option>
          <option value="rider">rider</option>
        </Select>

        {/* manager일 경우에만 마트 선택 UI 노출 */}
        {roleTemp === 'manager' && (
          <div style={{ marginTop: '16px' }}>
            <Label>관리할 마트 선택</Label>
            <Select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
            >
              <option value="">-- 마트 선택 --</option>
              {stores.map((store) => (
                <option key={store._id} value={store._id}>
                  {store.name} ({store.address})
                </option>
              ))}
            </Select>
          </div>
        )}

        <Button onClick={handleRegister}>회원가입</Button>
      </Card>
    </Container>
  );
}
