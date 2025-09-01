import express from "express";
import Cart from "../models/cart.js";
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 장바구니 조회
router.get("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "관리자는 장바구니를 사용할 수 없습니다." });
  }
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  res.json(cart || { items: [] });
});

// 장바구니 담기
router.post("/add", authMiddleware, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "관리자는 장바구니를 사용할 수 없습니다." });
  }

  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
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

export default router;
