import express from "express";
import Cart from "../models/cart.js";
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 장바구니 조회
router.get("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "관리자는 장바구니를 사용할 수 없습니다." });
  }

  const cart = await Cart.findOne({ user: req.user._id })
    .populate({
      path: "items.product",
      populate: { path: "store" } // ✅ product.store 까지 채움
    });

  res.json(cart || { items: [] });
});


// 장바구니 담기
router.post("/add", authMiddleware, async (req, res) => {
  console.log("req.user from token:", req.user); // ✅ 확인

  if (req.user.role !== "user") {
    return res.status(403).json({ message: "관리자는 장바구니를 사용할 수 없습니다." });
  }

  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const itemIndex = cart.items.findIndex((i) => i.product.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity || 1;
  } else {
    cart.items.push({ product: productId, quantity: quantity || 1 });
  }

  await cart.save();
  res.json(cart);
});

// 장바구니 항목 제거
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
