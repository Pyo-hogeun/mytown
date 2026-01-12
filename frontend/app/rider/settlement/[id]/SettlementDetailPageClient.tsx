// app/settlement/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/utils/axiosInstance";
import styled from "styled-components";
import Container from "@/app/component/Container";
import Button from "@/app/component/Button";

interface Order {
  _id: string;
  totalPrice: number;
  store?: { name: string };
  completedAt: string;
}

interface Settlement {
  _id: string;
  weekStart: string;
  weekEnd: string;
  totalLength: number;
  commission: number;
  status: string;
  orders: Order[];
}

const OrderItem = styled.div`
  padding: 12px;
  border-bottom: 1px solid #eee;
`;

const SettlementDetailPageClient = () => {
  const params = useParams();
  const router = useRouter(); // ✅ router 선언

  const id = params?.id as string;

  const [settlement, setSettlement] = useState<Settlement | null>(null);

  useEffect(() => {
    if (!id) return;
    axios.get(`/settlement/${id}`).then((res) => {
      setSettlement(res.data.settlement);
    });
  }, [id]);

  if (!settlement) return <Container>로딩중...</Container>;

  return (
    <Container>
      <h2><Button onClick={() => router.push('/rider?tab=settlement')}>뒤로</Button> 정산 상세</h2>
      <p>
        기간: {new Date(settlement.weekStart).toLocaleDateString()} ~{" "}
        {new Date(settlement.weekEnd).toLocaleDateString()}
      </p>
      <p>배달 총 건수: {settlement.totalLength} 개</p>
      <p>수수료: {settlement.commission.toLocaleString()}원</p>
      <p>상태: {settlement.status}</p>

      <h3>주문 내역</h3>
      {settlement.orders.map((o) => (
        <OrderItem key={o._id}>
          <div>매장: {o.store?.name || "-"}</div>
          <div>금액: {o.totalPrice.toLocaleString()}원</div>
          <div>완료일: {new Date(o.completedAt).toLocaleString()}</div>
        </OrderItem>
      ))}
    </Container>
  );
}
export default SettlementDetailPageClient;
