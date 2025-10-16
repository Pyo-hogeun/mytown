"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { cancelOrder, fetchOrders } from "@/redux/slices/orderSlice";
import Container from "../component/Container";
import styled from "styled-components";
import Button from "../component/Button";
import ReviewForm from "../component/ReviewForm";
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
const ItemList = styled.div`
  margin: 0;
  padding-left: 18px;
  >li{
    margin-bottom: 5px;
  }
`;
const DeliveryInfo = styled.div`
  margin-top: 12px;
  border: 1px solid #f3f3f3;
  border-radius: 10px;
  padding: 12px;
`
const OrdersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  // redux의 주문 상태(목록, 로딩 상태, 에러) 가져오기
  const { orders, status, error } = useSelector((s: RootState) => s.order);
  const [openReviewKey, setOpenReviewKey] = useState<string | null>(null);


  // 로딩 플래그 (redux 상의 status 사용)
  const isLoading = status === "processing";

  // 로컬: 현재 취소 요청이 진행중인 주문들의 id 목록
  // -> 각 주문별 버튼을 비활성화하고 "취소중..." 표시하기 위해 사용
  const [cancellingIds, setCancellingIds] = useState<string[]>([]);

  // 마운트 시 주문 목록 조회
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const empty = useMemo(() => (orders ? orders.length === 0 : true), [orders]);

  const formatKrw = (n: number) => n.toLocaleString() + "원";

  /**
   * 주문 취소 처리 함수
   *
   * 동작 방식 (pessimistic):
   * 1) 사용자 확인(confirm) -> 취소 요청 시작
   * 2) 로컬 cancellingIds에 orderId 추가(버튼 비활성화)
   * 3) dispatch(cancelOrder).unwrap() 로 서버 응답을 기다림
   * 4) 성공 시: alert로 알리고, dispatch(fetchOrders())로 목록을 다시 불러옴(갱신)
   * 5) 실패 시: 에러 안내
   * 6) finally: cancellingIds에서 제거(버튼 재활성화)
   *
   * 이유:
   * - 서버 상태(특히 다른 클라이언트/관리자에 의해 상태가 변경될 수 있음)를 신뢰하고,
   *   실제 성공 응답을 받은 뒤 목록을 갱신하는 방식이 안전함.
   */
  const handleCancel = useCallback(
    async (orderId: string) => {
      if (!confirm("정말 주문을 취소하시겠습니까?")) return;

      try {
        // 1) 취소 진행 표시 위해 로컬에 추가
        setCancellingIds((prev) => [...prev, orderId]);

        // 2) cancelOrder thunk 실행 (unwrap으로 에러 throw 가능)
        //    -> thunk 내부에서 서버로 PATCH /order/:id/cancel 호출
        await dispatch(cancelOrder(orderId)).unwrap();

        // 3) 성공 처리: 사용자 알림 + 목록 갱신
        alert("주문이 취소되었습니다.");

        // 반드시 최신 목록을 다시 조회하여 UI에 반영 (서버에서 populate한 최신 데이터 포함)
        await dispatch(fetchOrders());
        // 주의: fetchOrders가 실패하면 redux 상태의 error에 남게 됨
      } catch (err: any) {
        // 에러 처리: thunk가 reject되면 여기로 옴
        // err.message가 없을 수 있으므로 안전하게 문자열화
        const msg = err?.message || err?.toString() || "주문 취소 중 오류가 발생했습니다.";
        alert(`주문 취소 실패: ${msg}`);
      } finally {
        // 4) 진행중표시 제거
        setCancellingIds((prev) => prev.filter((id) => id !== orderId));
      }
    },
    [dispatch]
  );

  const handleToggleReview = (key: string) => {
    setOpenReviewKey(prev => (prev === key ? null : key));
  };

  return (
    <Container>
      {isLoading && <p>주문 내역을 불러오는 중...</p>}
      {error && <p>주문 조회 중 오류가 발생했습니다: {String(error)}</p>}
      {empty && !isLoading && <p>주문 내역이 없습니다.</p>}

      {!isLoading && !error && !empty && (
        <>
          <h1 style={{ marginBottom: 16 }}>내 주문 내역</h1>

          <List>
            {orders.map((order) => {
              const createdAt = order.createdAt ? new Date(order.createdAt) : undefined;

              // 취소 버튼 비활성화 조건:
              // - 상태가 취소 가능 상태가 아니면 비활성화 (delivering/completed 등)
              // - 혹은 이미 취소 요청이 진행중이면 비활성화
              const isCancellable = order.status === "pending" || order.status === "accepted";
              const isCancelling = cancellingIds.includes(order._id);


              return (
                <li key={order._id}>
                  {/* 주문 상단 정보 */}
                  <OrderInfo>
                    <h2 style={{ margin: 0, fontSize: 18 }}>주문번호: {order._id}</h2>
                    <div style={{ color: "#666", fontSize: 13 }}>{createdAt ? createdAt.toLocaleString() : ""}</div>
                  </OrderInfo>

                  <div style={{ marginTop: 8, fontSize: 14, color: "#333" }}>
                    결제방법: {String(order.paymentMethod || "-")}{" "}
                    {"  ·  "}
                    상태: {order.status || "-"}
                  </div>

                  {/* 매장 + 상품 목록 */}
                  <OrderItem>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>
                      매장: {typeof order.store === "object" ? order.store?.name : String(order.store ?? "가맹점")}
                    </div>

                    <ItemList>
                      {(order.orderItems || []).map((it, iidx) => {
                        const name = typeof it.product === "object"
                          ? it.product?.name || it.product?._id
                          : String(it.product ?? "상품명없음");
                        const productId =
                          typeof it.product === 'object'
                            ? it.product?._id
                            : String(it.product ?? '');
                        const line = (it.unitPrice || 0) * (it.quantity || 0);
                        const reviewKey = `${order._id}-${productId}`;
                        return (
                          <div key={iidx}>
                            상품: {name} {formatKrw(line)}<br />
                            {it.optionName ? `옵션: ${it.optionName}(+${it.optionExtraPrice})` : false}<br />
                            수량: {it.quantity}
                            {order.status === 'completed' && (
                              <>
                                <br />
                                <br />
                                <Button onClick={() => handleToggleReview(reviewKey)}>
                                  리뷰작성
                                </Button>
                                {openReviewKey === reviewKey && (
                                  <ReviewForm
                                    orderId={order._id}
                                    productId={productId}
                                    onClose={() => setOpenReviewKey(null)}
                                  />
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </ItemList>
                  </OrderItem>
                  <DeliveryInfo>
                    <h3>배송정보</h3>
                    <div>수령자명: {order.receiver}</div>
                    <div>연락처: {order.phone}</div>
                    <div>배송받을주소: {order.address}</div>

                  </DeliveryInfo>

                  {/* 합계 */}
                  <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", fontWeight: 700 }}>
                    총 결제금액&nbsp; {formatKrw(order.totalPrice ?? 0)}
                  </div>


                  {/* 주문취소 버튼 */}
                  <Button
                    onClick={() => {
                      // 클릭 시 비동기 함수 실행
                      handleCancel(order._id);
                    }}
                    // 비활성화 조건: 취소 불가 상태이거나 이미 취소중
                    disabled={!isCancellable || isCancelling}
                    style={{ marginTop: 12 }}
                  >
                    {isCancelling ? "취소중..." : "주문취소"}
                  </Button>



                </li>
              );
            })}
          </List>
        </>
      )}
    </Container>
  );
};
export default OrdersPage