'use client';

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchAvailableOrders, assignOrder } from "@/redux/slices/riderOrderSlice";

const PageWrapper = styled.div`
  padding: 16px;
`;

const OrderCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background: #0056b3;
  }
`;

const AvailableOrdersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((state: RootState) => state.riderOrders);

  useEffect(() => {
    dispatch(fetchAvailableOrders());
  }, [dispatch]);

  const handleAssign = (orderId: string) => {
    dispatch(assignOrder(orderId));
  };

  return (
    <PageWrapper>
      <h2>📦 배정 전 주문 목록</h2>
      {loading && <p>불러오는 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {items.length === 0 && !loading && <p>현재 배정 가능한 주문이 없습니다.</p>}
      {items.map((order) => (
        <OrderCard key={order._id}>
          <p><strong>수령인:</strong> {order.receiver}</p>
          <p><strong>주소:</strong> {order.address}</p>
          <p><strong>연락처:</strong> {order.phone}</p>
          <p><strong>희망 배송시간:</strong> {order.deliveryTime}</p>
          <Button onClick={() => handleAssign(order._id)}>이 주문 배정받기</Button>
        </OrderCard>
      ))}
    </PageWrapper>
  );
};

export default AvailableOrdersPage;
