'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/utils/axiosInstance';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Spinner from './Spinner';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
  }
`;

const Select = styled.select`
  padding: 4px;
`;

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [loadingIds, setLoadingIds] = useState<string[]>([]); // 로딩 중인 userId 저장

  // 사용자 목록 조회
  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  // role 수정 요청
  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
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

  return (
    <div>
      <h2>사용자 목록</h2>
      <Table>
        <thead>
          <tr>
            <th>이름</th>
            <th>이메일</th>
            <th>권한</th>
            <th>가입일</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
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
                        handleRoleChange(user._id, e.target.value as 'user' | 'admin')
                      }
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
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
