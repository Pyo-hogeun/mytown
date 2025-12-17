'use client';

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  assignRiderToOrder,
  fetchAvailableRiders,
  fetchManagerOrders,
  UserOrder,
} from "@/redux/slices/orderSlice";
import Button from "@/app/component/Button";
import Select from "@/app/component/Select";

const Container = styled.div`
  padding: 20px;
`;

const Grid = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1em;
  padding: 0;
  margin: 0;
  > li {
    list-style: none;
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 16px;
    background: #fff;
  }

  ${(props) => props.theme.breakpoints.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const Info = styled.div`
  margin-bottom: 6px;
`;

const AssignButton = styled(Button)`
  width: 100%;
  margin-top: 12px;
`;

const AssignedTag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 8px;
  background: #f0f4ff;
  color: #1f4b99;
  font-size: 12px;
  margin-left: 8px;
`;

const OrdersAssignPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { orders, availableRiders, ridersStatus } = useSelector((state: RootState) => state.order);
  const [selectedRiders, setSelectedRiders] = useState<Record<string, string>>({});

  const formatDistance = (riderId: string) => {
    const rider = availableRiders.find((r) => r._id === riderId);
    if (!rider) return "";
    if (rider.distanceFromStore === null || rider.distanceFromStore === undefined) {
      return "(거리 정보 없음)";
    }
    return `(매장 기준 약 ${rider.distanceFromStore.toFixed(1)}km)`;
  };

  const renderRiderLocation = (riderId: string) => {
    const rider = availableRiders.find((r) => r._id === riderId);
    if (!rider?.riderInfo?.location) return "위치 정보 없음";
    const { lat, lng, updatedAt } = rider.riderInfo.location;
    const timestamp = updatedAt ? new Date(updatedAt).toLocaleString() : "업데이트 시간 정보 없음";
    return `${lat?.toFixed(5)}, ${lng?.toFixed(5)} (업데이트: ${timestamp})`;
  };

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
    dispatch(fetchAvailableRiders());
  }, [user, router, dispatch]);

  useEffect(() => {
    setSelectedRiders((prev) => {
      const updated = { ...prev };
      orders.forEach((order) => {
        if (order.assignedRider?._id && !updated[order._id]) {
          updated[order._id] = order.assignedRider._id;
        }
      });
      return updated;
    });
  }, [orders]);

  const pendingOrders = useMemo(
    () => orders.filter((order) => ["accepted", "assigned"].includes(order.status ?? "")),
    [orders]
  );

  const handleAssign = async (order: UserOrder) => {
    const riderId = selectedRiders[order._id];
    if (!riderId) {
      alert("배정할 라이더를 선택해주세요.");
      return;
    }

    const confirmText = order.assignedRider?.name
      ? `해당 주문을 ${order.assignedRider.name} → ${availableRiders.find((r) => r._id === riderId)?.name} 라이더에게 재배정할까요?`
      : "선택한 라이더로 주문을 배정하시겠습니까?";

    if (!confirm(confirmText)) return;

    try {
      await dispatch(assignRiderToOrder({ orderId: order._id, riderId })).unwrap();
      await dispatch(fetchAvailableRiders());
      alert("라이더가 배정되었습니다.");
    } catch (err: any) {
      alert(err?.message || "라이더 배정에 실패했습니다.");
    }
  };

  if (!user || user.role !== "manager") {
    return <p>접근 권한이 없습니다.</p>;
  }

  return (
    <Container>
      <h1>라이더 수동 배정</h1>
      <p>가맹점 주문을 수동으로 라이더에게 배정합니다.</p>
      {pendingOrders.length === 0 && <p>배정이 필요한 주문이 없습니다.</p>}
      <Grid>
        {pendingOrders.map((order) => (
          <li key={order._id}>
            <Info>
              <Label>주문번호</Label>
              {order._id}
              {order.assignedRider?.name && <AssignedTag>배정됨</AssignedTag>}
            </Info>
            <Info>
              <Label>수령자</Label>
              {order.receiver} / {order.phone}
            </Info>
            <Info>
              <Label>주소</Label>
              {order.address}
            </Info>
            <Info>
              <Label>현재 상태</Label>
              {order.status}
            </Info>
            {order.assignedRider?.name && (
              <Info>
                <Label>현재 배정 라이더</Label>
                {order.assignedRider.name} ({order.assignedRider.phone || "연락처 없음"})
                {order.assignedRider.riderInfo?.location && (
                  <div>
                    위치: {`${order.assignedRider.riderInfo.location.lat?.toFixed(5) ?? "-"}, ${
                      order.assignedRider.riderInfo.location.lng?.toFixed(5) ?? "-"
                    }`}
                  </div>
                )}
              </Info>
            )}
            <Info>
              <Label>배정할 라이더 선택</Label>
              <Select
                value={selectedRiders[order._id] || ""}
                onChange={(e) =>
                  setSelectedRiders((prev) => ({ ...prev, [order._id]: e.target.value }))
                }
                disabled={ridersStatus === "loading"}
                >
                  <option value="" disabled>
                    라이더를 선택하세요
                  </option>
                  {availableRiders.map((rider) => (
                    <option key={rider._id} value={rider._id}>
                      {rider.name} {rider.phone ? `(${rider.phone})` : ""} {formatDistance(rider._id)}
                    </option>
                  ))}
                </Select>
            </Info>
            {selectedRiders[order._id] && (
              <Info>
                <Label>선택한 라이더 위치</Label>
                {renderRiderLocation(selectedRiders[order._id])}
              </Info>
            )}
            <AssignButton onClick={() => handleAssign(order)} disabled={availableRiders.length === 0}>
              {availableRiders.length === 0 ? "배정 가능한 라이더 없음" : "라이더 배정"}
            </AssignButton>
          </li>
        ))}
      </Grid>
    </Container>
  );
};

export default OrdersAssignPage;
