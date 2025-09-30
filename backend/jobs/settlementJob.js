// jobs/settlementJob.js
import Order from "../models/Order.js";
import Settlement from "../models/Settlement.js";
import dayjs from "dayjs";

export const generateWeeklySettlements = async () => {
  try {
    // 이번 주차 기간 계산 (월요일 ~ 일요일)
    const now = dayjs();
    const weekStart = now.startOf("week").toDate(); // 월요일 00:00
    const weekEnd = now.endOf("week").toDate();     // 일요일 23:59

    // 완료된 주문 가져오기
    const completedOrders = await Order.find({
      status: "completed",
      completedAt: { $gte: weekStart, $lte: weekEnd },
    });

    // 라이더별로 그룹핑
    const riderMap = new Map();
    completedOrders.forEach((order) => {
      if (!order.assignedRider) return;
      const riderId = order.assignedRider.toString();
      if (!riderMap.has(riderId)) {
        riderMap.set(riderId, []);
      }
      riderMap.get(riderId).push(order);
    });

    // Settlement 생성
    for (const [riderId, orders] of riderMap.entries()) {
      const totalLength = orders.length;
      const commission = totalLength * 3000; // 예: 20% 정산

      await Settlement.create({
        rider: riderId,
        weekStart,
        weekEnd,
        orders: orders.map((o) => o._id),
        totalLength,
        commission,
        status: "pending",
      });
    }

    console.log("✅ 주간 정산 생성 완료");
  } catch (err) {
    console.error("정산 생성 오류:", err);
  }
};
