// app/orders/page.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { fetchOrders } from "@/redux/slices/orderSlice";

export default function OrdersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, status, error } = useSelector((s: RootState) => s.order);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const isLoading = status === "processing";

  const empty = useMemo(() => orders.length === 0, [orders]);

  const formatKrw = (n: number) => n.toLocaleString() + "원";

  const calcOrderTotal = (o: any) => {
    if (typeof o?.totalAmount === "number") return o.totalAmount;
    if (typeof o?.totalPrice === "number") return o.totalPrice;
    // fallback: storeOrders 기준 합산
    try {
      return (o.storeOrders || []).reduce(
        (sum: number, so: any) =>
          sum +
          (so.items || []).reduce(
            (s: number, it: any) => s + (it.price || 0) * (it.quantity || 0),
            0
          ),
        0
      );
    } catch {
      return 0;
    }
  };

  if (isLoading) return <p>주문 내역을 불러오는 중...</p>;
  if (error) return <p>주문 조회 중 오류가 발생했습니다: {error}</p>;
  if (empty) return <p>주문 내역이 없습니다.</p>;

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 16 }}>내 주문 내역</h1>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {orders.map((order) => {
          const createdAt =
            order.createdAt ? new Date(order.createdAt) : undefined;
          const total = calcOrderTotal(order);

          return (
            <li
              key={order._id}
              style={{
                border: "1px solid #eaeaea",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <h2 style={{ margin: 0, fontSize: 18 }}>
                  주문번호: {order._id}
                </h2>
                <div style={{ color: "#666", fontSize: 13 }}>
                  {createdAt ? createdAt.toLocaleString() : ""}
                </div>
              </div>

              <div style={{ marginTop: 8, fontSize: 14, color: "#333" }}>
                결제방법: {String(order.paymentMethod || "-")}
                {"  ·  "}
                상태: {order.status || "-"}
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "grid",
                  gap: 8,
                }}
              >
                {(order.storeOrders || []).map((so, idx) => {
                  const storeName =
                    typeof so.store === "string"
                      ? so.store
                      : so.store?.name || so.store?._id || "가맹점";
                  return (
                    <div
                      key={(so as any)._id ?? idx}
                      style={{
                        border: "1px solid #f3f3f3",
                        borderRadius: 10,
                        padding: 12,
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>
                        매장: {storeName}
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {(so.items || []).map((it, iidx) => {
                          const name =
                            (typeof it.product === "object" &&
                              (it.product?.name || (it.product as any)?._id)) ||
                            it.productName ||
                            String(it.product ?? "상품");
                          const line =
                            (it.price || 0) * (it.quantity || 0);
                          return (
                            <li key={iidx}>
                              {name} × {it.quantity} = {formatKrw(line)}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>

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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
