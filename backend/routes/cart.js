// routes/cart.js
import express from "express";
import Cart from "../models/cart.js";
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @openapi
 * /cart:
 *   get:
 *     summary: 장바구니 조회
 *     description: 현재 로그인한 사용자의 장바구니를 조회합니다. (관리자 계정은 접근 불가)
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 장바구니 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 650abcd1234ef567890abcd1
 *                       product:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 650abcd1234ef567890abcd2
 *                           name:
 *                             type: string
 *                             example: 사과
 *                           store:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 650abcd1234ef567890abcd3
 *                               name:
 *                                 type: string
 *                                 example: 마트A
 *                       quantity:
 *                         type: integer
 *                         example: 2
 *       403:
 *         description: 관리자 계정은 장바구니 사용 불가
 */
router.get("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "관리자는 장바구니를 사용할 수 없습니다." });
  }

  const cart = await Cart.findOne({ user: req.user._id })
    .populate({
      path: "items.product",
      populate: { path: "store" }
    });

  res.json(cart || { items: [] });
});

/**
 * @openapi
 * /cart/add:
 *   post:
 *     summary: 장바구니 담기
 *     description: 사용자가 상품을 장바구니에 추가합니다. 같은 상품이 이미 있으면 수량만 증가합니다.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 650abcd1234ef567890abcd2
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: 장바구니 업데이트 후 반환
 *       403:
 *         description: 관리자 계정은 장바구니 사용 불가
 */
router.post("/add", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;

  if (req.user.role !== "user") return res.status(403).json({ message: "관리자는 장바구니를 사용할 수 없습니다." });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const itemIndex = cart.items.findIndex((i) => i.product.toString() === productId);
  if (itemIndex > -1) cart.items[itemIndex].quantity += quantity || 1;
  else cart.items.push({ product: productId, quantity: quantity || 1 });

  await cart.save();

  const populatedCart = await cart.populate({
    path: "items.product",
    populate: { path: "store" }
  });

  res.json(populatedCart);
});

/**
 * @openapi
 * /cart/remove:
 *   post:
 *     summary: 장바구니 항목 제거
 *     description: 특정 장바구니 항목을 삭제합니다.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: string
 *                 example: 650abcd1234ef567890abcd4
 *     responses:
 *       200:
 *         description: 항목 제거 후 장바구니 반환
 *       403:
 *         description: 관리자 계정은 장바구니 사용 불가
 *       404:
 *         description: 장바구니 없음
 */
router.post("/remove", authMiddleware, async (req, res) => {
  if (req.user.role !== "user") return res.status(403).json({ message: "관리자는 장바구니를 사용할 수 없습니다." });

  const { itemId } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "장바구니 없음" });

  cart.items = cart.items.filter(item => item._id.toString() !== itemId);
  await cart.save();
  res.json(cart);
});

export default router;
