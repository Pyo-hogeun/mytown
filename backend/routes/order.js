// routes/order.js
import express from "express";
import Cart from "../models/cart.js";
import Order from "../models/order.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 주문 생성 (스토어별 분리)
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res
        .status(403)
        .json({ message: "관리자는 주문할 수 없습니다." });
    }

    const { items } = req.body; 
    // items 예시: [{ _id, product: { _id, price, store }, quantity }]

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "주문할 항목이 없습니다." });
    }

    // 스토어별로 그룹화
    const storeGrouped = items.reduce((acc, item) => {
      const storeId = item.product.store.toString();
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
        user: req.user._id,  // ✅ id 대신 _id 사용
        store: storeId,
        orderItems: storeItems.map((i) => ({
          product: i.product._id,
          quantity: i.quantity,
          unitPrice: i.product.price,   // ✅ 필수 필드 추가
        })),
        totalPrice,
        status: "pending",
      });

      await order.save();
      createdOrders.push(order);
    }

    // 주문 완료 후 장바구니에서 제거
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = cart.items.filter(
        (ci) => !items.find((i) => i._id === ci._id.toString())
      );
      await cart.save();
    }

    return res.json({
      message: "스토어별 주문 생성 완료",
      orders: createdOrders.map((o) => ({
        orderId: o._id,
        store: o.store,
        totalPrice: o.totalPrice,
      })),
    });
  } catch (err) {
    console.error("주문 생성 오류:", err);
    return res.status(500).json({ message: "주문 생성 중 오류가 발생했습니다." });
  }
});

// 주문 목록 조회 (로그인한 사용자)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id; // 인증 미들웨어에서 넣어줌
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("store") // 가게 정보 populate
      .lean();

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "주문 조회 실패", error: err });
  }
});
// 특정 주문 조회
router.get("/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ _id: orderId, user: req.user._id })
      .populate("store")
      .lean();

    if (!order) return res.status(404).json({ message: "주문을 찾을 수 없음" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "주문 상세 조회 실패", error: err });
  }
});
export default router;
