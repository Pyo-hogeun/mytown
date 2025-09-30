// rider/orders/page.tsx
'use client';

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { clearOrders, fetchAssignedOrders, updateOrderStatus } from "@/redux/slices/riderOrderSlice";
import styled from "styled-components";
import { OrderStatus } from "@/redux/slices/orderSlice";
import Button from "@/app/component/Button";
import CodeColorTransfer from "@/app/component/CodeColorTransfer";
const OrderItem = styled.div`
  margin-top: 12px;
  border: 1px solid #999;
  border-radius: 10px;
  padding: 12px;
`;
const SubTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  `;
const DeliveryCharge = styled.div`
  font-size: 16px;
  font-weight: 700;
`
const List = styled.div`
  display: flex;
  font-size: 13px;
  margin-bottom: 0.5em;
`;
const Label = styled.span`
  flex-basis: 20%;
  font-weight: 700;
`;
const TotalPrice = styled.div`
`;
const RiderButton = styled(Button) <{ $delivering?: boolean; $completed?: boolean }>`
  width: 100%;
  background-color: #0070f3;
  color: #fff;
  height: 43px;
  margin-top: 2em;
  &:hover{
    background-color: #187ef4;
  }
  
  ${(props) => props.$completed ? `
    background-color: red;
  `: false}
`;
const Page = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentOrders, loading, error } = useSelector(
    (state: RootState) => state.riderOrders
  );
  const statusTransfer = (value: OrderStatus) => {
    switch (value) {
      case "pending":
        return "대기중"
      case "accepted":
        return "승인"
      case "assigned":
        return "배차완료"
      case "delivering":
        return "배달중"
      case "completed":
        return "완료"
      case "cancelled":
        return "취소"
    }
  }

  useEffect(() => {
    dispatch(fetchAssignedOrders());
    return () => {
      dispatch(clearOrders());
    };
  }, [dispatch]);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!currentOrders) return <p>주문 정보를 찾을 수 없습니다.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>나에게 배정된 주문 : {currentOrders.length}</h2>
      {currentOrders.map((order) => (
        <OrderItem key={order._id}>
          <List><Label>주문번호:</Label><CodeColorTransfer id={order._id} /></List>
          <List><Label>가게:</Label> {order.store.name}</List>
          <List><Label>가게주소:</Label> {order.store.address}</List>
          <List><Label>수령인:</Label> {order.receiver}</List>
          <List><Label>연락처:</Label> {order.phone}</List>
          <List><Label>주소:</Label> {order.address}</List>
          <List><Label>배달 시간:</Label> {order.deliveryTime.day ? order.deliveryTime.day + ' ' + order.deliveryTime.time : "지정 없음"}</List>
          <List><Label>상태:</Label> {statusTransfer(order.status)}</List>
          <SubTitle>주문 항목</SubTitle>
          <div>
            {order.orderItems.map((item, idx) => (
              <List key={idx}>
                {item.product?.name} {item.unitPrice}원
                ({item.optionName || "옵션 없음"} {item.optionExtraPrice ? `+${item.optionExtraPrice.toLocaleString()}` : false})
                x {item.quantity}개
              </List>
            ))}
          </div>
          <TotalPrice>주문 금액: {order.totalPrice.toLocaleString()}원</TotalPrice>
          <DeliveryCharge>수수료: {order.deliveryCharge}원</DeliveryCharge>

          {/* ✅ 상태 변경 버튼 */}
          {order.status === "assigned" && (
            <RiderButton
              onClick={() => dispatch(updateOrderStatus({ orderId: order._id, status: "delivering" }))}
            >
              배달 시작
            </RiderButton>
          )}
          {order.status === "delivering" && (
            <RiderButton
              $delivering={true}
              onClick={() => dispatch(updateOrderStatus({ orderId: order._id, status: "completed" }))}
            >
              배달 완료
            </RiderButton>
          )}
          {order.status === "completed" && (
            <RiderButton
              $completed={true}
              disabled
            >
              배달 완료
            </RiderButton>
          )}
        </OrderItem>
      ))}
    </div>
  );
}
export default Page