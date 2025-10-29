'use client';

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import { fetchManagerOrders, OrderStatus, updateOrderStatus } from "@/redux/slices/orderSlice";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Input from "@/app/component/Input";
import Button from "@/app/component/Button";
import OrderItem from "./OrderItem";
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
const SearchItem = styled.div`
  display: flex;
  margin-bottom: 1rem;
  gap: 1em;
  input{
    margin-bottom: 0;
  }
`;
const SearchButton = styled(Button)`
  width: 100%;
  margin-bottom: 1em;
  height: 43px;
`
const ManagerOrdersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((s: RootState) => s.auth);
  const { orders, status, error } = useSelector((s: RootState) => s.order);
  const [searchName, setSearchName] = useState(""); // 🔎 검색어 상태
  const [searchPhone, setSearchPhone] = useState(""); // 🔎 전화번호 검색 상태

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
    dispatch(fetchManagerOrders({ userName: searchName, phone: searchPhone }));
  };
  const handleReset = () => {
    setSearchName('');
    setSearchPhone('');
    dispatch(fetchManagerOrders());
  }

  // ✅ useMemo로 검색 결과 최적화
  // const filteredOrders = useMemo(() => {
  //   if (!searchName && !searchPhone) return orders;
  
  //   return orders.filter((o) => {
  //     const nameMatch = searchName
  //       ? o.user?.name?.toLowerCase().includes(searchName.toLowerCase())
  //       : true;
  //     const phoneMatch = searchPhone
  //       ? o.phone?.toLowerCase().includes(searchPhone.toLowerCase())
  //       : true;
  
  //     return nameMatch && phoneMatch; // ✅ 반드시 true/false 반환
  //   });
  // }, [orders, searchName, searchPhone]);
  

  if (!user || user.role !== "manager") {
    return <p>접근 권한이 없습니다.</p>;
  }

  if (error) return <p>에러 발생: {error}</p>;


  return (
    <div style={{ padding: 20 }}>
      <h1>매장 주문 관리</h1>

      {/* 🔎 검색 UI */}
      <SearchItem>
        <Input
          type="text"
          placeholder="주문자 이름 검색"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </SearchItem>
      <SearchItem>
        <Input
          type="text"
          placeholder="연락처 검색"
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
        />
      </SearchItem>
      <SearchButton onClick={handleSearch}>검색</SearchButton>
      <SearchButton onClick={handleReset}>초기화</SearchButton>
      {
        status === "idle" && <p>주문 목록을 불러오는 중...</p>
      }

      {
        !orders || orders.length === 0 && <p>주문이 없습니다.</p>
      }

      <List>
        {orders.map((order) => (
          <OrderItem key={order._id} order={order} onStatusChange={handleStatusChange} />
        ))}
      </List>
    </div>
  );
};

export default ManagerOrdersPage;
