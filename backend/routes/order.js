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
 * @swagger
 * tags:
 *   name: Order
 *   description: 주문 관련 API
 */

/**
 * @swagger
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
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                       description: 상품 ID
 *                     store:
 *                       type: string
 *                       description: 스토어 ID
 *                     quantity:
 *                       type: integer
 *                     unitPrice:
 *                       type: number
 *                     optionId:
 *                       type: string
 *               receiver:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               deliveryTime:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [card, kakao, naver]
 *               rememberDelivery:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 스토어별 주문 생성 성공
 *       400:
 *         description: 요청 데이터 오류
 *       500:
 *         description: 서버 오류
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      items,
      receiver,
      phone,
      address,
      deliveryTime,
      paymentMethod,
      totalPrice,
      rememberDelivery, // ✅ 프론트에서 체크 여부 전달
    } = req.body;


    if (!items || items.length === 0) {
      return res.status(400).json({ message: "주문할 항목이 없습니다." });
    }
    if (!receiver || !phone || !address) {
      return res.status(400).json({ message: "배송 정보가 누락되었습니다." });
    }

    // ✅ 스토어별 그룹화 (프론트에서 storeId를 같이 보내야 함)
    const storeGrouped = items.reduce((acc, item) => {
      if (!item.store) throw new Error(`상품 ${item.product}에 storeId가 없습니다.`);
      const storeId = item.store;
      if (!acc[storeId]) acc[storeId] = [];
      acc[storeId].push(item);
      return acc;
    }, {});

    // ✅ 1) 주문 전 재고 검증
    for (const i of items) {
      const product = await Product.findById(i.product);
      if (!product) {
        return res.status(400).json({ message: `상품을 찾을 수 없습니다: ${i.product}` });
      }

      if (i.optionId) {
        // 옵션 재고 체크
        const option = product.options.id(i.optionId);
        if (!option) {
          return res.status(400).json({ message: `옵션을 찾을 수 없습니다: ${i.optionId}` });
        }
        if (option.stockQty < i.quantity) {
          return res.status(400).json({
            message: `재고 부족: ${product.name} (${option.name}), 남은 수량: ${option.stockQty}`,
          });
        }
      } else {
        // 상품 재고 체크
        if (product.stockQty < i.quantity) {
          return res.status(400).json({
            message: `재고 부족: ${product.name}, 남은 수량: ${product.stockQty}`,
          });
        }
      }
    }

    const createdOrders = [];

    for (const [storeId, storeItems] of Object.entries(storeGrouped)) {

      const order = new Order({
        user: req.user._id,
        store: storeId,
        orderItems: storeItems.map((i) => ({
          product: i.product,
          quantity: i.quantity,
          unitPrice: i.unitPrice,       // 프론트에서 계산된 가격
          optionName: i.optionName,     // 프론트 전달
          optionExtraPrice: i.optionExtraPrice ?? 0,
        })),
        totalPrice: totalPrice,
        status: "pending",
        receiver,
        phone,
        address,
        deliveryTime,
        paymentMethod,
        rememberDelivery,
        deliveryCharge: 3000 //임시 수수료 3000원
      });

      await order.save();

      // ✅ 주문 성공 시 재고 차감
      for (const i of storeItems) {
        const product = await Product.findById(i.product);
        if (!product) continue;

        if (i.optionId) {
          // 옵션이 있는 경우 해당 옵션 재고 감소
          const option = product.options.id(i.optionId);
          if (option) {
            option.stockQty = Math.max(0, option.stockQty - i.quantity);
          }
        } else {
          // 옵션 없는 상품은 전체 재고 감소
          product.stockQty = Math.max(0, product.stockQty - i.quantity);
        }

        await product.save();
      }
      createdOrders.push(order);
    }

    // ✅ 주문 완료 후 장바구니 정리
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = cart.items.filter(
        (ci) => !items.find((i) => i.product === ci.product.toString())
      );
      await cart.save();
    }

    // ✅ 배송지 기억하기 체크 시 User 모델 업데이트
    if (rememberDelivery) {
      await User.findByIdAndUpdate(req.user._id, {
        savedDeliveryInfo: {
          receiver,
          phone,
          address,
          updatedAt: new Date(),
        },
      });
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
 * @swagger
 * /order:
 *   get:
 *     summary: 내 주문 목록 조회
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 주문 목록 반환
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
 * @swagger
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
 *         description: 특정 사용자 ID로 필터링
 *       - in: query
 *         name: userName
 *         schema:
 *           type: string
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 매니저 주문 목록 반환
 *       403:
 *         description: 접근 권한 없음
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
 * @swagger
 * /order/{orderId}:
 *   get:
 *     summary: 특정 주문 상세 조회
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: 주문 ID
 *     responses:
 *       200:
 *         description: 주문 상세 정보 반환
 *       404:
 *         description: 주문을 찾을 수 없음
 *       500:
 *         description: 주문 상세 조회 실패
 */
// ✅ 특정 주문 조회
router.get("/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;

    // 라이더는 본인에게 배정된 주문만 조회 가능
    if (req.user.role === "rider") {
      const order = await Order.findOne({
        _id: id,
        assignedRider: req.user._id,
      })
        .populate("store", "name address")
        .populate("orderItems.product", "name price");

      if (!order) {
        return res.status(404).json({ message: "주문을 찾을 수 없습니다." });
      }

      return res.json({ order });
    }

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
 * @swagger
 * /order/{id}/cancel:
 *   patch:
 *     summary: 주문 취소
 *     description: 로그인한 사용자가 본인의 주문을 취소합니다. 배송 중(`delivering`) 또는 완료(`completed`) 상태는 취소 불가.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
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
 *       400:
 *         description: 취소 불가 (배송 중/완료)
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

    order.status = "canceled";
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("주문 취소 오류:", err);
    res.status(500).json({ message: "주문 취소 실패" });
  }
});


/**
 * @swagger
 * /order/{id}/status:
 *   patch:
 *     summary: 주문 상태 변경 (매니저 전용)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 주문 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, assigned, delivering, completed, canceled]
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

    // ✅ 매니저의 소속 매장만 변경 가능
    if (order.store._id.toString() !== req.user.store.toString()) {
      return res.status(403).json({ message: "본인 매장의 주문만 변경할 수 있습니다." });
    }

    // ✅ 상태 검증
    const validStatuses = ["pending", "accepted", "assigned", "delivering", "completed", "canceled"];
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

/**
 * @swagger
 * /order/rider/available:
 *   get:
 *     summary: 라이더 - 배정 가능한 주문 목록
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 배정 가능한 주문 목록 반환
 *       403:
 *         description: 라이더 전용 접근
 *       500:
 *         description: 서버 오류
 */

router.get("/rider/available", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "rider") {
      return res.status(403).json({ message: "라이더만 접근 가능합니다." });
    }

    const orders = await Order.find({
      status: "accepted",
      assignedRider: null,
    }).populate("store", "name address");

    return res.json({ orders });
  } catch (err) {
    console.error("라이더 주문 조회 오류:", err);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /order/rider/{orderId}/assign:
 *   post:
 *     summary: 라이더 - 주문 배정하기
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: 배정할 주문 ID
 *     responses:
 *       200:
 *         description: 주문 배정 완료
 *       400:
 *         description: 이미 배정된 주문
 *       403:
 *         description: 라이더 전용 접근
 *       500:
 *         description: 서버 오류
 */
router.post("/rider/:orderId/assign", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "rider") {
      return res.status(403).json({ message: "라이더만 접근 가능합니다." });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.orderId, status: "accepted", assignedRider: null },
      { status: "assigned", assignedRider: req.user._id },
      { new: true }
    ).populate("store", "name address");

    if (!order) {
      return res.status(400).json({ message: "이미 다른 라이더에게 배정되었거나 주문을 찾을 수 없습니다." });
    }

    return res.json({
      message: "주문 배정 완료",
      order,
    });
  } catch (err) {
    console.error("주문 배정 오류:", err);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /order/rider/assigned:
 *   get:
 *     summary: 라이더 - 배정된 주문 목록
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 배정된 주문 목록 반환
 *       403:
 *         description: 라이더 전용 접근
 *       500:
 *         description: 서버 오류
 */
router.get("/rider/assigned", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "rider") {
      return res.status(403).json({ message: "라이더만 접근 가능합니다." });
    }

    const orders = await Order.find({
      assignedRider: req.user._id,
      status: { $in: ["assigned", "delivering"] },
    })
    .populate("store")
    .populate("orderItems.product");

    return res.json({ orders });
  } catch (err) {
    console.error("배정된 주문 조회 오류:", err);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /order/rider/completed:
 *   get:
 *     summary: 라이더 - 완료된 주문 목록
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 완료된 주문 목록 반환
 *       403:
 *         description: 라이더 전용 접근
 *       500:
 *         description: 서버 오류
 */
router.get("/rider/completed", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "rider") {
      return res.status(403).json({ message: "라이더만 접근 가능합니다." });
    }

    const orders = await Order.find({
      assignedRider: req.user._id,
      status: { $in: ["completed"] },
    })
    .populate("store")
    .populate("orderItems.product");

    return res.json({ orders });
  } catch (err) {
    console.error("배달완료된 주문 조회 오류:", err);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /order/rider/{id}/status:
 *   patch:
 *     summary: 라이더 - 주문 상태 변경
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 상태 변경할 주문 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [assigned, delivering, completed]
 *     responses:
 *       200:
 *         description: 상태 변경 성공
 *       400:
 *         description: 잘못된 상태 값
 *       403:
 *         description: 라이더 전용 접근
 *       404:
 *         description: 주문 없음
 *       500:
 *         description: 서버 오류
 */

// 라이더 전용 상태 변경
router.patch("/rider/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "rider") {
      return res.status(403).json({ message: "라이더만 접근 가능합니다." });
    }

    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({
      _id: id,
      assignedRider: req.user._id, // 본인 배정 주문만
    })
    .populate("store");

    if (!order) return res.status(404).json({ message: "주문 없음" });

    const validStatuses = ["assigned", "delivering", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "잘못된 상태 값" });
    }

    order.status = status;

    // ✅ 완료 시 completedAt 기록
    if (status === "completed") {
      order.completedAt = new Date();
    }
    
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/**
 * @swagger
 * /order/seed:
 *   post:
 *     summary: 개발용 - 랜덤 주문 100개 생성
 *     tags: [Order]
 *     responses:
 *       200:
 *         description: 랜덤 주문 생성 완료
 *       500:
 *         description: 시드 데이터 생성 오류
 */

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
          "canceled",
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
