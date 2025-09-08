//상품 모델
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  storeName: { type: String, required: true }, // ✅ 추가
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stockQty: { type: Number, default: 0 },
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', ProductSchema);
