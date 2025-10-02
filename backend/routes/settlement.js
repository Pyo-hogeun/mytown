// routes/settlement.js
import express from "express";
import Settlement from "../models/settlement.js";
import Order from '../models/order.js';
import { authMiddleware } from "../middlewares/authMiddleware.js";
import dayjs from "dayjs";

const router = express.Router();
// GET /api/settlement/rider
/**
 * @swagger
 * /api/settlement/rider:
 *   get:
 *     summary: 로그인한 라이더의 정산 내역 조회
 *     tags: [Settlement]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 라이더 정산 내역 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 settlements:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       rider:
 *                         type: string
 *                       weekStart:
 *                         type: string
 *                         format: date
 *                       weekEnd:
 *                         type: string
 *                         format: date
 *                       totalLength:
 *                         type: number
 *                       commission:
 *                         type: number
 *                       status:
 *                         type: string
 *                         enum: [pending, paid]
 */
router.get("/rider", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "rider") {
      return res.status(403).json({ message: "라이더만 접근 가능합니다." });
    }

    const settlements = await Settlement.find({ rider: req.user._id })
      .sort({ weekStart: -1 });

    res.json({ settlements });
  } catch (err) {
    console.error("정산 조회 오류:", err);
    res.status(500).json({ message: "정산 조회 실패" });
  }
});

//정산내역 상세조회
// GET /api/settlement/:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "rider") {
      return res.status(403).json({ message: "라이더만 접근 가능합니다." });
    }

    const { id } = req.params;

    const settlement = await Settlement.findOne({
      _id: id,
      rider: req.user._id,
    })
      .populate("rider", "name")
      .populate({
        path: "orders",
        populate: { path: "store", select: "name" },
      });

    if (!settlement) {
      return res.status(404).json({ message: "정산 내역 없음" });
    }

    res.json({ settlement });
  } catch (err) {
    console.error("정산 상세 조회 오류:", err);
    res.status(500).json({ message: "정산 상세 조회 실패" });
  }
});



/**
 * @swagger
 * /api/settlement/{id}/pay:
 *   patch:
 *     summary: 특정 정산 지급 완료 처리 (관리자 전용)
 *     tags: [Settlement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Settlement ID
 *     responses:
 *       200:
 *         description: 지급 완료 처리 성공
 *       403:
 *         description: 관리자만 접근 가능
 *       404:
 *         description: 정산을 찾을 수 없음
 */
router.patch("/:id/pay", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "관리자만 정산 지급 상태를 변경할 수 있습니다." });
    }

    const { id } = req.params;
    const settlement = await Settlement.findById(id);
    if (!settlement) {
      return res.status(404).json({ message: "정산을 찾을 수 없습니다." });
    }

    settlement.status = "paid";
    await settlement.save();

    res.json({ success: true, settlement });
  } catch (err) {
    console.error("정산 지급 완료 처리 오류:", err);
    res.status(500).json({ message: "정산 지급 처리 실패" });
  }
});

/**
 * @swagger
 * /api/settlement/manual:
 *   post:
 *     summary: 특정 주차 정산 수동 생성 (관리자 전용)
 *     tags: [Settlement]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weekStart:
 *                 type: string
 *                 format: date
 *                 description: 주차 시작일 (YYYY-MM-DD)
 *               weekEnd:
 *                 type: string
 *                 format: date
 *                 description: 주차 종료일 (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: 수동 정산 생성 성공
 *       403:
 *         description: 관리자만 접근 가능
 */
router.post("/manual", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "관리자만 정산을 생성할 수 있습니다." });
    }
    
    const { weekStart, weekEnd } = req.body;
    if (!weekStart || !weekEnd) {
      return res.status(400).json({ message: "weekStart, weekEnd 값이 필요합니다." });
    }
    
    // ✅ 기존 정산 삭제 (재생성 지원)
    await Settlement.deleteMany({ weekStart, weekEnd });
    
    // ✅ 완료된 주문 조회
    console.log('주 시작 : ',dayjs(weekStart).startOf("day").toDate());
    const completedOrders = await Order.find({
      status: "completed",
      completedAt: {
        $gte: dayjs(weekStart).startOf("day").toDate(),
        $lte: dayjs(weekEnd).endOf("day").toDate(),
      },
    });
    
    if (completedOrders.length === 0) {
      return res.json({ message: "해당 기간에 완료된 주문이 없습니다.", weekstart: dayjs(weekStart).startOf("day").toDate() });
    }

    // ✅ 라이더별 그룹핑
    const riderMap = new Map();
    completedOrders.forEach((order) => {
      if (!order.assignedRider) return;
      const riderId = order.assignedRider.toString();
      if (!riderMap.has(riderId)) {
        riderMap.set(riderId, []);
      }
      riderMap.get(riderId).push(order);
    });

    // ✅ Settlement 생성
    const settlements = [];
    for (const [riderId, orders] of riderMap.entries()) {
      const totalLength = orders.length;
      const commission = totalLength * 3000; // 고정 3천원

      const settlement = new Settlement({
        rider: riderId,
        weekStart: dayjs(weekStart).toDate(),
        weekEnd: dayjs(weekEnd).toDate(),
        totalLength,  // ✅ 주문 총 건수
        commission,   // ✅ 정산 수수료 총 합계
        status: "pending",
      });

      await settlement.save();
      settlements.push(settlement);
    }

    res.json({ success: true, settlements });
  } catch (err) {
    console.error("수동 정산 생성 오류:", err);
    res.status(500).json({ message: "정산 생성 실패" });
  }
});

export default router;
