// models/Settlement.js
import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema({
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  weekStart: { type: Date, required: true },   // 정산 시작일 (주차 기준 월요일 00:00 등)
  weekEnd: { type: Date, required: true },     // 정산 종료일 (일요일 23:59)
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  totalLength: { type: Number, default: 0 },   // 주문 총 갯수
  commission: { type: Number, default: 0 },    // 라이더 수수료 (예: 20%)
  status: {
    type: String,
    enum: ["pending", "paid"],                 // 정산 상태
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Settlement", settlementSchema);
