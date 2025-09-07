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

export default router;
