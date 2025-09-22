// routes/cart.js
import express from "express";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
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
 *                       optionId:
 *                         type: string
 *                         example: 650abcd1234ef567890abcd3
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
// ✅ 장바구니에 상품 추가
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId, optionId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "상품을 찾을 수 없습니다." });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // 같은 상품+옵션 조합이 이미 있는지 확인
    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        ((item.optionId && item.optionId.toString()) === (optionId || null))
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({ product: productId, optionId: optionId || null, quantity: quantity || 1 });
    }

    await cart.save();

    await cart.populate("items.product");
    res.json({ items: cart.items });
  } catch (err) {
    res.status(500).json({ message: "장바구니 추가 실패", error: err.message });
  }
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

// ✅ routes/cart.js (삭제 후 응답을 populate한 형태로 반환)
router.delete("/remove/:itemId", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "장바구니가 없습니다." });

    // 해당 아이템 제거
    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
    await cart.save();

    // 제거 후 최신 장바구니 populate해서 반환 (GET /cart 과 동일한 형태)
    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: "items.product",
        populate: { path: "store" }
      });

    res.json(updatedCart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: "장바구니 삭제 실패", error: err.message });
  }
});

export default router;
