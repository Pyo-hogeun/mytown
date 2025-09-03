// models/order.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
});

// 주문 스키마 정의
const OrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  store: { type: Schema.Types.ObjectId, ref: "Store", required: true },
  rider: { type: Schema.Types.ObjectId, ref: "Rider" }, // 배정 전일 수 있어 required 아님
  status: {
    type: String,
    enum: ["pending", "accepted", "delivering", "completed", "cancelled"],
    default: "pending",
  },
  orderItems: [orderItemSchema],
  createdAt: { type: Date, default: Date.now },
});

// 기존 모델이 이미 존재하면 재사용 (Hot Reload 방지)
export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
