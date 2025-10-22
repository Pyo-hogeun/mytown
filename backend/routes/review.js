// routes/review.js
import express from "express";
import Review from "../models/review.js";
import Order from "../models/order.js";
import { authMiddleware } from "../middlewares/authMiddleware.js"; // 로그인 인증 미들웨어

const router = express.Router();

/**
 * ✅ 리뷰 작성
 * POST /reviews
 * body: { orderId, rating, content }
 */
// ✅ 리뷰 작성
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { orderId, product, rating, content } = req.body;

    if (!orderId || !product || !rating || !content) {
      return res.status(400).json({ message: "모든 필드를 입력해주세요." });
    }

    // 주문이 실제로 사용자 소유인지 확인
    const order = await Order.findById(orderId).populate("orderItems.product");
    if (!order || order.user.toString() !== req.user._id.toString()) {
      console.log('ORDER: ', order);
      console.log('ORDER USER: ', order.user);
      console.log('REQ USER: ', req.user._id);
      return res.status(403).json({ message: "리뷰 작성 권한이 없습니다." });
    }

    // ✅ 리뷰 생성
    const review = await Review.create({
      user: req.user._id,
      order: orderId,
      product,
      rating,
      content,
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("리뷰 등록 오류:", error);
    res.status(500).json({ message: "리뷰 등록 중 오류가 발생했습니다." });
  }
});

/**
 * ✅ 특정 주문의 리뷰 조회
 * GET /reviews/:orderId
 */
router.get("/order/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const reviews = await Review.find({ order: orderId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("리뷰 조회 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});
// 특정 상품 리뷰 조회
router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("리뷰 조회 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

/**
 * ✅ 사용자별 리뷰 목록 조회
 * GET /reviews/user/:userId
 */
router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // 본인만 조회 가능
    if (req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "본인 리뷰만 조회할 수 있습니다." });
    }

    const reviews = await Review.find({ user: userId })
      .populate("product", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("사용자 리뷰 조회 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

export default router;
