'use client';

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import { fetchManagerOrders, OrderStatus, updateOrderStatus, validStatuses } from "@/redux/slices/orderSlice";
import { useRouter } from "next/navigation";
import Select from "@/app/component/Select";
import styled from "styled-components";
const List = styled.ul`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1em;
  padding: 0;
  margin: 0;
  > li{
    list-style: none;
    border: 1px solid #ccc;
    border-radius: 12px;
    padding: 16px;
    background-color: #fff;
  }
`;
const Item = styled.div`
  margin-bottom: 0.4em;
`;
const Label = styled.span`
  display: inline-block;
  margin-right: 10px;
`;
const ItemList = styled.div`
  font-size: 0.9em;
  margin: 10px;
  > div{
    margin-bottom: 0.4em;
  }
`
const ManagerOrdersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((s: RootState) => s.auth);
  const { orders, status, error } = useSelector((s: RootState) => s.order);
  const [searchName, setSearchName] = useState(""); // 🔎 검색어 상태
  const statuses: OrderStatus[] = [...validStatuses]; // ✅ 안전하게 복사

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "manager") {
      alert("접근 권한이 없습니다.");
      router.push("/");
      return;
    }
    dispatch(fetchManagerOrders());
  }, [dispatch, user, router]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus, oldStatus?: string) => {
    if (newStatus === oldStatus) return; // 상태가 같으면 무시

    if (confirm(`주문 상태를 "${newStatus}"로 변경하시겠습니까?`)) {
      dispatch(updateOrderStatus({ orderId, status: newStatus as any }))
        .unwrap()
        .then(() => alert("상태가 변경되었습니다."))
        .catch((err) => alert("상태 변경 실패: " + err.message));
    }
  };

  const handleSearch = () => {
    console.log('searchName', searchName);
    dispatch(fetchManagerOrders({ userName: searchName }));
  };

  if (!user || user.role !== "manager") {
    return <p>접근 권한이 없습니다.</p>;
  }

  if (error) return <p>에러 발생: {error}</p>;


  return (
    <div style={{ padding: 20 }}>
      <h1>매장 주문 관리</h1>

      {/* 🔎 검색 UI */}
      <div style={{ marginBottom: "1em" }}>
        <input
          type="text"
          placeholder="주문자 이름 검색"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{ padding: "6px 10px", marginRight: "8px" }}
        />
        <button onClick={handleSearch}>검색</button>
      </div>
      {
        status === "idle" && <p>주문 목록을 불러오는 중...</p>
      }

      {
        !orders || orders.length === 0 && <p>주문이 없습니다.</p>
      }

      <List>
        {orders.map((order) => {
          // string -> Date -> formatted string
          const createdDate = order.createdAt ? new Date(order.createdAt) : null;
          const formattedDate = createdDate
            ? createdDate.toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
            : '';
          return (
            <li key={order._id} style={{}}>
              <h3>주문번호: {order._id}</h3>
              <Item><Label>주문시간: </Label>{formattedDate}</Item>
              <Item><Label>주문자명:</Label> {order.receiver}</Item>
              <Item><Label>수령자명:</Label> {order.user?.name}</Item>
              <Item><Label>연락처:</Label> {order.phone}</Item>
              <Item><Label>주소:</Label> {order.address}</Item>
              <Item><Label>가게명:</Label> {typeof order.store === 'string'
                ? order.store
                : order.store?.name}</Item>
              <Item><Label>희망 배송시간:</Label> {order.deliveryTime?.day} ⏰{order.deliveryTime?.time} </Item>
              <Item><Label>총 결제금액:</Label> {order.totalPrice?.toLocaleString()}원</Item>

              <Item>
                <Label>상품목록:</Label>
                <ItemList>
                  {order.orderItems.map((item, idx) => (
                    <div key={idx}>
                      {typeof item.product === "object" ? item.product?.name : item.product} × {item.quantity}
                    </div>
                  ))}
                </ItemList>
              </Item>

              {/* 🔽 드롭다운 상태 변경 */}
              <label>
                상태:
              </label>
              <Select
                value={order.status ?? "pending"} // fallback 추가
                onChange={(e) =>
                  handleStatusChange(order._id, e.target.value as OrderStatus)
                }
                disabled={order.status === "completed" || order.status === "cancelled"}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {/* UI 표시용은 한글 매핑 */}
                    {status === "pending" && "대기중"}
                    {status === "accepted" && "승인됨"}
                    {status === "delivering" && "배송중"}
                    {status === "completed" && "완료"}
                    {status === "cancelled" && "취소됨"}
                  </option>
                ))}
              </Select>
            </li>
          )
        })}
      </List>
    </div>
  );
};

export default ManagerOrdersPage;
