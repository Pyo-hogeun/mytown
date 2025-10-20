// models/Order.js
import mongoose from "mongoose";
const { Schema } = mongoose;

// ✅ 주문 상품 단위 스키마
const orderItemSchema = new Schema({
product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: "Store", // 각 상품의 소속 상점
    required: true,
  },
  optionId: {
    type: Schema.Types.ObjectId,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  optionName: String,
  optionExtraPrice: {
    type: Number,
    min: 0,
  },
}, { _id: false });

// ✅ 주문 스키마
const OrderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rider: {
    type: Schema.Types.ObjectId,
    ref: "Rider",
  },
  deliveryCharge: {
    type: Number,
    min: 0,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "assigned", "delivering", "completed", "canceled"],
    default: "pending",
  },
  orderItems: {
    type: [orderItemSchema],
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: "주문 항목은 최소 1개 이상이어야 합니다.",
    },
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },

  // ✅ 배송 관련
  receiver: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  rememberDelivery: { type: Boolean },
  deliveryTime: {
    day: { type: String, trim: true },
    time: { type: String, trim: true },
  },

  // ✅ 결제 관련
  paymentMethod: {
    type: String,
    enum: ["card", "kakao", "naver"],
    required: true,
  },

  // ✅ 라이더 배정 및 완료 관련
  assignedRider: {
    type: Schema.Types.ObjectId,
    ref: "User", // role: rider
    default: null,
  },
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

// ✅ 기존 모델이 존재하면 재사용
export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
