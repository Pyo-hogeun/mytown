// components/OrderItem.tsx
import React from "react";
import styled from "styled-components";
import { UserOrder, OrderStatus, validStatuses } from "@/redux/slices/orderSlice";
import Select from "@/app/component/Select";

const Item = styled.div`
  margin-bottom: 0.4em;
`;
const Label = styled.span`
  display: inline-block;
  margin-right: 10px;
`;

interface OrderItemProps {
  order: UserOrder;
  onStatusChange: (orderId: string, newStatus: OrderStatus, oldStatus?: string) => void;
}

const OrderItem = ({ order, onStatusChange }: OrderItemProps) => {
  const statuses: OrderStatus[] = [...validStatuses];
  const createdDate = order.createdAt ? new Date(order.createdAt) : null;
  const formattedDate = createdDate
    ? createdDate.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  return (
    <li>
      <h3>주문번호: {order._id}</h3>
      <Item><Label>주문시간: </Label>{formattedDate}</Item>
      <Item><Label>수령자명:</Label> {order.receiver}</Item>
      <Item><Label>주문자명:</Label> {order.user?.name}</Item>
      <Item><Label>연락처:</Label> {order.phone}</Item>
      <Item><Label>주소:</Label> {order.address}</Item>
      <Item><Label>가게명:</Label> {typeof order.store === "string" ? order.store : order.store?.name}</Item>
      <Item><Label>총 결제금액:</Label> {order.totalPrice?.toLocaleString()}원</Item>

      <label>상태:</label>
      <Select
        value={order.status ?? "pending"}
        onChange={(e) =>
          onStatusChange(order._id, e.target.value as OrderStatus, order.status)
        }
        disabled={order.status === "completed" || order.status === "cancelled"}
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status === "pending" && "대기중"}
            {status === "accepted" && "승인됨"}
            {status === "delivering" && "배송중"}
            {status === "completed" && "완료"}
            {status === "cancelled" && "취소됨"}
          </option>
        ))}
      </Select>
    </li>
  );
};

// ✅ props가 바뀌지 않으면 리렌더링 방지
export default React.memo(OrderItem);
