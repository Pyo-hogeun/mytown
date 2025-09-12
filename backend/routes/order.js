// routes/order.js
import express from "express";
import Cart from "../models/cart.js";
import Order from "../models/order.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { faker } from "@faker-js/faker";

const router = express.Router();
/**
 * @openapi
 * /order:
 *   post:
 *     summary: 주문 생성
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - receiver
 *               - phone
 *               - address
 *               - paymentMethod
 *             properties:
 *               items:
 *                 type: array
 *                 description: 주문할 상품 목록
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                       description: 상품 ID
 *                     quantity:
 *                       type: integer
 *                       description: 수량
 *               receiver:
 *                 type: string
 *                 description: 수령인 이름
 *               phone:
 *                 type: string
 *                 description: 수령인 연락처
 *               address:
 *                 type: string
 *                 description: 배송지 주소
 *               deliveryTime:
 *                 type: string
 *                 format: date-time
 *                 description: 요청 배송 시간 (선택)
 *               paymentMethod:
 *                 type: string
 *                 enum: [pending, accepted, delivering, completed, cancelled]
 *                 description: 결제 수단
 *                 
 *     responses:
 *       200:
 *         description: 스토어별 주문 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderId:
 *                         type: string
 *                       store:
 *                         type: string
 *                       totalPrice:
 *                         type: number
 *                       receiver:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       address:
 *                         type: string
 *                       deliveryTime:
 *                         type: string
 *                 cart:
 *                   type: object
 *       400:
 *         description: 요청 데이터 오류 (상품이나 배송정보 누락 등)
 *       500:
 *         description: 서버 오류
 */
// ✅ 주문 생성
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, receiver, phone, address, deliveryTime, paymentMethod } = req.body;

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
        paymentMethod
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

/**
 * @openapi
 * /order:
 *   get:
 *     summary: 내 주문 목록 조회
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 주문 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: 주문 조회 실패
 */
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

/**
 * @openapi
 * /order/manager:
 *   get:
 *     summary: 매니저 전용 주문 목록 조회
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         required: false
 *         description: 특정 사용자 ID로 필터링
 *     responses:
 *       200:
 *         description: 매니저가 자신의 매장 주문 목록 반환
 *       403:
 *         description: 접근 권한 없음 (매니저 전용)
 *       500:
 *         description: 주문 조회 실패
 */
router.get("/manager", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "접근 권한이 없습니다." });
    }

    const { user, userName, phone } = req.query;

    const filter = { store: req.user.store };

    if (user) {
      filter.user = user; // 특정 userId
    } else if (userName) {
      // 이름으로 검색
      const matchedUsers = await User.find({
        name: new RegExp(userName, "i"), // 대소문자 무시 부분일치 검색
      }).select("_id");
      const userIds = matchedUsers.map((u) => u._id);
      filter.user = { $in: userIds };
    }

    if (phone) {
      filter.phone = new RegExp(phone, "i"); // 연락처 부분 일치 검색
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("orderItems.product", "name price")
      .lean();

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "주문 조회 실패", error: err.message });
  }
});




/**
 * @openapi
 * /order/{orderId}:
 *   get:
 *     summary: 특정 주문 상세 조회
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: 주문 ID
 *     responses:
 *       200:
 *         description: 주문 상세 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: 주문을 찾을 수 없음
 *       500:
 *         description: 주문 상세 조회 실패
 */
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

// ✅ 개발용 - 랜덤 주문 100개 생성 (1회 실행 후 제거 권장)
router.post("/seed", async (req, res) => {
  try {
    const users = await User.find();
    const products = await Product.find().populate("store");

    if (users.length === 0 || products.length === 0) {
      return res
        .status(400)
        .json({ message: "유저 또는 상품 데이터가 없습니다. 먼저 생성해주세요." });
    }

    const orders = [];

    for (let i = 0; i < 100; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;

      console.log('product.store', product.store.name);

      const order = new Order({
        user: user._id,
        store: product.store._id,  // ✅ ObjectId 저장
        orderItems: [
          {
            product: product._id,
            quantity,
            unitPrice: product.price,
          },
        ],
        totalPrice: quantity * product.price,
        status: faker.helpers.arrayElement([
          "pending",
          "accepted",
          "delivering",
          "completed",
          "cancelled",
        ]),
        receiver: faker.person.fullName(),
        phone: faker.phone.number("010-####-####"),
        address: faker.location.streetAddress(),
        deliveryTime: faker.date.soon({ days: 7 }),
      });
      
      orders.push(order);
    }

    await Order.insertMany(orders);
    res.json({ message: "랜덤 주문 100개 생성 완료 ✅" });
  } catch (err) {
    console.error("❌ 시드 데이터 생성 오류:", err);
    res.status(500).json({ message: "시드 데이터 생성 오류", error: err.message });
  }
});
export default router;
