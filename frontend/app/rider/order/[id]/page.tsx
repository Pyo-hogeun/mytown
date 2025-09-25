// rider/orders/[id]/page.tsx
'use client';

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchOrder, clearOrder } from "@/redux/slices/riderOrderSlice";

const Page = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentOrder, loading, error } = useSelector(
    (state: RootState) => state.riderOrders
  );

  useEffect(() => {
    dispatch(fetchOrder());
    return () => {
      dispatch(clearOrder());
    };
  }, [id, dispatch]);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!currentOrder) return <p>주문 정보를 찾을 수 없습니다.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>주문 상세</h2>
      <p><strong>가게:</strong> {currentOrder.store}</p>
      <p><strong>수령인:</strong> {currentOrder.receiver}</p>
      <p><strong>연락처:</strong> {currentOrder.phone}</p>
      <p><strong>주소:</strong> {currentOrder.address}</p>
      <p><strong>배달 시간:</strong> {currentOrder.deliveryTime || "지정 없음"}</p>
      <p><strong>상태:</strong> {currentOrder.status}</p>
      <h3>주문 항목</h3>
      <ul>
        {currentOrder.orderItems.map((item, idx) => (
          <li key={idx}>
            {item.product} ({item.optionName || "옵션 없음"}) - {item.quantity}개 × {item.unitPrice.toLocaleString()}원
          </li>
        ))}
      </ul>
      <p><strong>총 금액:</strong> {currentOrder.totalPrice.toLocaleString()}원</p>
    </div>
  );
}
export default Page