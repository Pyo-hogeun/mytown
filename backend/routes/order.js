// routes/order.js
import express from "express";
import Cart from "../models/cart.js";
import Order from "../models/order.js";
import Product from "../models/product.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ 주문 생성
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, receiver, phone, address, deliveryTime } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "주문할 항목이 없습니다." });
    }
    if (!receiver || !phone || !address) {
      return res.status(400).json({ message: "배송 정보가 누락되었습니다." });
    }

    // ✅ productId만 넘어왔다면 DB에서 populate
    const populatedItems = await Promise.all(
      items.map(async (i) => {
        const product = await Product.findById(i.product).populate("store");
        if (!product || !product.store) {
          throw new Error(`상품 ${i.product}에 스토어 정보가 없습니다.`);
        }
        return {
          product,
          quantity: i.quantity,
        };
      })
    );

    // ✅ 스토어별 그룹화
    const storeGrouped = populatedItems.reduce((acc, item) => {
      const storeId = item.product.store._id.toString();
      if (!acc[storeId]) acc[storeId] = [];
      acc[storeId].push(item);
      return acc;
    }, {});

    const createdOrders = [];

    for (const [storeId, storeItems] of Object.entries(storeGrouped)) {
      const totalPrice = storeItems.reduce(
        (sum, item) => sum + item.quantity * item.product.price,
        0
      );

      const order = new Order({
        user: req.user._id,
        store: storeId,
        orderItems: storeItems.map((i) => ({
          product: i.product._id,
          quantity: i.quantity,
          unitPrice: i.product.price,
        })),
        totalPrice,
        status: "pending",

        // ✅ 배송 필드 저장
        receiver,
        phone,
        address,
        deliveryTime,
      });

      await order.save();
      createdOrders.push(order);
    }

    // ✅ 주문 완료 후 장바구니 정리
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = cart.items.filter(
        (ci) => !items.find((i) => i.product._id === ci.product.toString())
      );
      await cart.save();
    }

    return res.json({
      message: "스토어별 주문 생성 완료",
      orders: createdOrders.map((o) => ({
        orderId: o._id,
        store: o.store,
        totalPrice: o.totalPrice,
        receiver: o.receiver,
        phone: o.phone,
        address: o.address,
        deliveryTime: o.deliveryTime,
      })),
      cart,
    });
  } catch (err) {
    console.error("주문 생성 오류:", err);
    return res.status(500).json({ message: err.message });
  }
});

// ✅ 주문 목록 조회
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("store")
      .populate("orderItems.product")
      .lean();

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "주문 조회 실패", error: err });
  }
});
// ✅ 매니저 전용 주문 조회
router.get("/manager", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "접근 권한이 없습니다." });
    }

    const orders = await Order.find({ store: req.user.store })
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("orderItems.product", "name price")
      .lean();

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "주문 조회 실패", error: err.message });
  }
});
// ✅ 특정 주문 조회
router.get("/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ _id: orderId, user: req.user._id })
      .populate("store")
      .populate("orderItems.product")
      .lean();

    if (!order) return res.status(404).json({ message: "주문을 찾을 수 없음" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "주문 상세 조회 실패", error: err });
  }
});

/**
 * @openapi
 * /order/{id}/cancel:
 *   patch:
 *     summary: 주문 취소
 *     description: 로그인한 사용자가 본인의 주문을 취소합니다. 배송 중(`delivering`) 또는 완료(`completed`) 상태인 주문은 취소할 수 없습니다.
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []   # JWT 인증 필요
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 취소할 주문의 ID
 *     responses:
 *       200:
 *         description: 주문 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 order:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64d1234abc5678ef90123456
 *                     status:
 *                       type: string
 *                       example: cancelled
 *                     totalPrice:
 *                       type: number
 *                       example: 32000
 *                     receiver:
 *                       type: string
 *                       example: 홍길동
 *                     phone:
 *                       type: string
 *                       example: "010-1234-5678"
 *                     address:
 *                       type: string
 *                       example: "서울특별시 강남구 테헤란로 123"
 *                     deliveryTime:
 *                       type: object
 *                       properties:
 *                         day:
 *                           type: string
 *                           example: "월요일"
 *                         time:
 *                           type: string
 *                           example: "14:30"
 *       400:
 *         description: 취소 불가 (배송 중/완료된 주문)
 *       403:
 *         description: 다른 사용자의 주문
 *       404:
 *         description: 주문 없음
 *       500:
 *         description: 서버 오류
 */
// ✅ 주문 취소
router.patch("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "주문을 찾을 수 없습니다." });


    // ✅ 본인 주문만 취소 가능
    if (order.user.toString() !== req.user._id.toString()) {

      console.log("order.user:", order.user.toString());
      console.log("req.user.id:", req.user._id.toString());
      return res.status(403).json({ message: "자신의 주문만 취소할 수 있습니다." });
    }

    // ✅ 상태 검증: 배송 시작 이후는 취소 불가
    if (["delivering", "completed"].includes(order.status)) {
      return res.status(400).json({ message: "배송 중/완료된 주문은 취소할 수 없습니다." });
    }

    order.status = "cancelled";
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("주문 취소 오류:", err);
    res.status(500).json({ message: "주문 취소 실패" });
  }
});


/**
 * @openapi
 * /order/{id}/status:
 *   patch:
 *     summary: 주문 상태 변경 (매니저 전용)
 *     description: 매니저가 해당 매장의 주문 상태를 변경합니다.
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 상태를 변경할 주문 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, delivering, completed]
 *     responses:
 *       200:
 *         description: 상태 변경 성공
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 주문 없음
 */
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "매니저만 주문 상태를 변경할 수 있습니다." });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findById(id).populate("store");
    
    if (!order) return res.status(404).json({ message: "주문을 찾을 수 없습니다." });
    
    console.log('order.store.toString()', order.store._id.toString());
    console.log('req.user.store.toString()', req.user.store.toString());

    // ✅ 매니저의 소속 매장만 변경 가능
    if (order.store._id.toString() !== req.user.store.toString()) {
      return res.status(403).json({ message: "본인 매장의 주문만 변경할 수 있습니다." });
    }

    // ✅ 상태 검증
    const validStatuses = ["pending", "accepted", "delivering", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "잘못된 상태 값입니다." });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("주문 상태 변경 오류:", err);
    res.status(500).json({ message: "상태 변경 실패" });
  }
});


export default router;
