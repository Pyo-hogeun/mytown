'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/utils/axiosInstance';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import Spinner from './Spinner';
import Button from './Button';
import Input from './Input';
import { fetchUsers } from '@/redux/slices/userSlice';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    // text-align: center;
  }
`;
const SearchItem = styled.div`
  display: flex;
  margin-bottom: 1rem;
  gap: 1em;
  input{
    margin-bottom: 0;
  }
`;
const SearchButton = styled(Button)`
  width: 100%;
  margin-bottom: 1em;
`
const Select = styled.select`
  padding: 4px;
`;

const UserList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { list } = useSelector((state:RootState)=>state.users);
  const [loadingIds, setLoadingIds] = useState<string[]>([]); // 로딩 중인 userId 저장


  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchAddress, setSearchAddress] = useState("");


  useEffect(() => {
    if (token) dispatch(fetchUsers());
  }, [token]);

  // role 수정 요청
  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'manager' | 'rider') => {
    setLoadingIds((prev) => [...prev, userId]); // 로딩 상태 추가
    try {
      await axios.patch(
        `/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers(); // 변경 후 다시 목록 갱신
    } catch (error) {
      console.error('role 변경 실패:', error);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== userId)); // 로딩 상태 제거
    }
  };

  // 검색 버튼에서
  const handleSearch = () => {
    console.log('click');
    dispatch(fetchUsers({
      name: searchName || undefined,
      email: searchEmail || undefined,
      role: searchRole || undefined,
      phone: searchPhone || undefined,
      address: searchAddress || undefined,
    }));
  };

  return (
    <div>
      <h2>사용자 목록</h2>

      {/* 🔎 검색 UI */}
      <SearchItem>
        <Input
          type="text"
          placeholder="사용자 이름 검색"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <Input
          type="text"
          placeholder="이메일 검색"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
        <Input
          type="text"
          placeholder="사용자 권한 검색"
          value={searchRole}
          onChange={(e) => setSearchRole(e.target.value)}
        />
        <Input
          type="text"
          placeholder="전화번호 검색"
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
        />
        <Input
          type="text"
          placeholder="주소 검색"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
        />
      </SearchItem>
      <SearchButton onClick={handleSearch}>검색</SearchButton>
      <Table>
        <thead>
          <tr>
            <th>아이디</th>
            <th>이름</th>
            <th>이메일</th>
            <th>권한</th>
            <th>가입일</th>
          </tr>
        </thead>
        <tbody>
          {list.map(user => (
            <tr key={user._id}>
              <td>{user._id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                {loadingIds.includes(user._id) ? (
                  <Spinner />
                ) : (
                  currentUser?.role === 'admin' ? (
                    <Select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value as 'user' | 'admin' | 'manager' | 'rider')
                      }
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                      <option value="manager">manager</option>
                      <option value="rider">rider</option>
                    </Select>
                  ) : (
                    user.role
                  )
                )}
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserList;
