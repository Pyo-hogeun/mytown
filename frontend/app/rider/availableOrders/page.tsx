'use client';

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchAvailableOrders, assignOrder } from "@/redux/slices/riderOrderSlice";
import Container from "@/app/component/Container";
import Button from "@/app/component/Button";
import { useRouter } from "next/navigation";

const OrderCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
`;

const AssignButton = styled(Button)`
width: 100%;
  background: #007bff;
  color: white;
  height: 43px;
  margin-top: 2em;
`;
const Charge = styled.span`
  font-size: 1.5em;
  color: #007bff;
`
const Page = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { items, loading, error } = useSelector((state: RootState) => state.riderOrders);

  useEffect(() => {
    dispatch(fetchAvailableOrders());
  }, [dispatch]);

  const handleAssign = async (orderId: string) => {
    try{
      const res = await dispatch(assignOrder(orderId));
      if(res){
        dispatch(fetchAvailableOrders());
      }
      
      router.push(`/rider`);
    } catch( err: any){
      console.error("배정 실패:", err);
      alert(err.response?.data?.message || "배정에 실패했습니다.");
    }
  };

  return (
    <Container>

      <h2>📦 배정 전 주문 목록</h2>
      {loading && <p>불러오는 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {items.length === 0 && !loading && <p>현재 배정 가능한 주문이 없습니다.</p>}
      {items.map((order) => (
        <OrderCard key={order._id}>
          <div><strong>수수료:</strong> <Charge>{order.deliveryCharge}</Charge></div>
          <div><strong>수령인:</strong> {order.receiver}</div>
          <div><strong>주소:</strong> {order.address}</div>
          <div><strong>연락처:</strong> {order.phone}</div>
          <div><strong>희망 배송시간:</strong> {order.deliveryTime?.day + order.deliveryTime?.time}</div>
          <AssignButton onClick={() => handleAssign(order._id)}>이 주문 배정받기</AssignButton>
        </OrderCard>
      ))}
    </Container>
  );
};

export default Page;
