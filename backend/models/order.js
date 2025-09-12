// models/order.js
import mongoose from "mongoose";

const { Schema } = mongoose;

// 주문 상품 단위 스키마
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
  totalPrice: { type: Number, required: true },

  // ✅ 배송 관련 필드 추가
  receiver: { type: String, required: true },     // 수령인
  phone: { type: String, required: true },        // 연락처
  address: { type: String, required: true },      // 배송 주소
  deliveryTime: {
    day: { type: String },                        // 요일 (월~일)
    time: { type: String },                       // 시각 (30분 단위)
  },
  // ✅ 결제 관련 필드 추가
  paymentMethod: {
    type: String,
    enum: ["card", "kakao", "naver"],
    required: true,
  },

  createdAt: { type: Date, default: Date.now },
});

// 기존 모델이 이미 존재하면 재사용 (Hot Reload 방지)
export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
