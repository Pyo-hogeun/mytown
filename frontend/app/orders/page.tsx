"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { cancelOrder, fetchOrders } from "@/redux/slices/orderSlice";
import Container from "../component/Container";
import styled from "styled-components";
import Button from "../component/Button";
const List = styled.ul`
  listStyle: none;
  padding: 0;
  margin: 0;
  > li{
    list-style: none;
    border: 1px solid #eaeaea;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    background-color: #fff;
  }
`;
const OrderInfo = styled.li`
  display: flex;
  justifyContent: space-between;
  alignItems: baseline;
  gap: 12px;
  flexWrap: wrap;
`;
const OrderItem = styled.div`
  margin-top: 12px;
  border: 1px solid #f3f3f3;
  border-radius: 10px;
  padding: 12px;
`;
const ItemList = styled.ul`
  margin: 0;
  padding-left: 18px;
  >li{
    margin-bottom: 5px;
  }
`
const OrdersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, status, error } = useSelector((s: RootState) => s.order);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const isLoading = status === "processing";
  const empty = useMemo(() => orders.length === 0, [orders]);

  const formatKrw = (n: number) => n.toLocaleString() + "원";

  const calcOrderTotal = (o: any) => {
    try {
      return (o.orderItems || []).reduce(
        (sum: number, it: any) =>
          sum + (it.unitPrice || 0) * (it.quantity || 0),
        0
      );
    } catch {
      return 0;
    }
  };

  return (
    <Container>
      {
        isLoading && (
          <p>주문 내역을 불러오는 중...</p>)
      }
      {
        error && (<p>주문 조회 중 오류가 발생했습니다: {error}</p>)
      }
      {
        empty && (
          <p>주문 내역이 없습니다.</p>
        )
      }
      {!isLoading && !error && !empty && (
        <>
          <h1 style={{ marginBottom: 16 }}>내 주문 내역</h1>

          <List>
            {orders.map((order) => {
              const createdAt =
                order.createdAt ? new Date(order.createdAt) : undefined;
              const total = calcOrderTotal(order);

              return (
                <li
                  key={order._id}
                >
                  {/* 주문 상단 정보 */}
                  <OrderInfo>
                    <h2 style={{ margin: 0, fontSize: 18 }}>
                      주문번호: {order._id}
                    </h2>
                    <div style={{ color: "#666", fontSize: 13 }}>
                      {createdAt ? createdAt.toLocaleString() : ""}
                    </div>
                  </OrderInfo>

                  <div style={{ marginTop: 8, fontSize: 14, color: "#333" }}>
                    결제방법: {String(order.paymentMethod || "-")}
                    {"  ·  "}
                    상태: {order.status || "-"}
                  </div>

                  {/* 매장 + 상품 목록 */}
                  <OrderItem>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>
                      매장:{" "}
                      {typeof order.store === "object"
                        ? order.store?.name
                        : String(order.store ?? "가맹점")}
                    </div>

                    <ItemList>
                      {(order.orderItems || []).map((it, iidx) => {
                        const name =
                          typeof it.product === "object"
                            ? it.product?.name || it.product?._id
                            : String(it.product ?? "상품");
                        const line = (it.unitPrice || 0) * (it.quantity || 0);
                        return (
                          <li key={iidx}>
                            {name} × {it.quantity} = {formatKrw(line)}
                          </li>
                        );
                      })}
                    </ItemList>
                  </OrderItem>

                  {/* 합계 */}
                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      justifyContent: "flex-end",
                      fontWeight: 700,
                    }}
                  >
                    총 결제금액&nbsp; {formatKrw(total)}
                  </div>

                  {
                    /* 주문취소 */
                    <Button
                      onClick={() => {
                        if (confirm("정말 주문을 취소하시겠습니까?")) {
                          dispatch(cancelOrder(order._id))
                            .unwrap()
                            .then(() => {
                              alert("주문이 취소되었습니다.");
                            })
                            .catch((err) => {
                              alert("주문 취소 실패: " + err.message);
                            });
                        }
                      }}
                      disabled={order.status !== "pending" && order.status !== "accepted"}
                    >
                      주문취소
                    </Button>
                  }
                </li>
              );
            })}
          </List>
        </>
      )
      }
    </Container>
  );
}
export default OrdersPage