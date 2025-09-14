// 파일: models/cart.js
// 설명: 장바구니 모델
// - user: 장바구니 소유자
// - items: 장바구니 상품 목록 (상품, 옵션, 수량)

import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        optionId: { type: mongoose.Schema.Types.ObjectId, ref: "Option", default: null }, // ✅ 상품 옵션 ID (없을 수 있음)
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);