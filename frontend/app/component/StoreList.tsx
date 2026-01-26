'use client';

import { Store } from '@/redux/slices/storeSlice';
import { AppDispatch, RootState } from '@/redux/store';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  white-space: nowrap;
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

const MapButton = styled.a`
  display: inline-block;
  padding: 6px 10px;
  background-color: #2563eb;
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #1d4ed8;
  }
`;

const getMapUrl = (store: Store) => {
  const { lat, lng } = store.location ?? {};

  if (lat !== undefined && lng !== undefined) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  if (store.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`;
  }

  return '';
};

const StoreList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: stores, loading } = useSelector((state: RootState) => state.store)

  // ✅ iOS WebView에서 axios vs fetch 분리 테스트
  async function testStores() {
    const res = await fetch("https://mytown-myui.onrender.com/api/stores", {
      method: "GET",
      credentials: "include", // 쿠키 기반이면 include, 아니면 빼도 됨
    });

    const text = await res.text(); // ✅ json() 대신 text()로 먼저 받아보기(파싱 이슈 분리)
    console.log("status:", res.status);
    console.log("body:", text.slice(0, 200));
  }
  useEffect(()=>{
    testStores();
  },[]);

  useEffect(() => {
    // dispatch(fetchStores())
  }, [dispatch]);

  if (loading) return <p>불러오는 중...</p>;

  return (
    <div>
      <h2>등록된 매장 목록</h2>
      {stores.length === 0 ? (
        <p>등록된 매장이 없습니다.</p>
      ) : (
        <TableScroll>

          <Table>
            <thead>
              <tr>
                <Th>이름</Th>
                <Th>주소</Th>
                <Th>전화번호</Th>
                <Th>위도</Th>
                <Th>경도</Th>
                <Th>지도보기</Th>
                <Th>등록일</Th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => {
                const mapUrl = getMapUrl(store);

                return (
                  <tr key={store._id}>
                    <Td><Link href={`/products?storeId=${store._id}&storeName=${store.name}`}>{store.name}</Link></Td>
                    <Td>{store.address}</Td>
                    <Td>{store.phone}</Td>
                    <Td>{store.location?.lat ?? '-'}</Td>
                    <Td>{store.location?.lng ?? '-'}</Td>
                    <Td>
                      {mapUrl ? (
                        <MapButton
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          지도보기
                        </MapButton>
                      ) : (
                        '-'
                      )}
                    </Td>
                    <Td>{new Date(store.createdAt).toLocaleDateString()}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableScroll>
      )}
    </div>
  );
};

export default StoreList;
