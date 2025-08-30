'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchStores, Store } from '@/utils/api/stores';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const Th = styled.th`
  border-bottom: 2px solid #ddd;
  padding: 10px;
  text-align: left;
`;

const Td = styled.td`
  border-bottom: 1px solid #eee;
  padding: 10px;
`;

const StoreList: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const data = await fetchStores();
        setStores(data);
      } catch (err) {
        console.error('스토어 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStores();
  }, []);

  if (loading) return <p>불러오는 중...</p>;

  return (
    <div>
      <h2>등록된 매장 목록</h2>
      {stores.length === 0 ? (
        <p>등록된 매장이 없습니다.</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>이름</Th>
              <Th>주소</Th>
              <Th>전화번호</Th>
              <Th>등록일</Th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store._id}>
                <Td>{store.name}</Td>
                <Td>{store.address}</Td>
                <Td>{store.phone}</Td>
                <Td>{new Date(store.createdAt).toLocaleDateString()}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default StoreList;
