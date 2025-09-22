//상품 모델
import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  extraPrice: { type: Number, default: 0 },
  stockQty: { type: Number, default: 0 }
});

const ProductSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  storeName: { type: String, required: true }, // ✅ 추가
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stockQty: { type: Number, default: 0 },
  imageUrl: String,
  options: [optionSchema], // ✅ 옵션 배열 필드 추가
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', ProductSchema);
