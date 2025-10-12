// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// 라이더정보 스키마
const RiderInfoSchema = new mongoose.Schema({
  deliveryArea: { type: String, required: true }, // 예: 강남구 역삼동
  settlementAccount: {
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    verified: { type: Boolean, default: false },
  },
  vehicleType: { type: String, enum: ["motorcycle", "car"], required: true },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: function () {
      return !this.snsId; // ✅ SNS 로그인 사용자는 이름 필수 아님
    },
  },
  email: {
    type: String,
    unique: true,
    required: function () {
      return !this.snsId; // ✅ SNS 로그인 사용자는 이메일 필수 아님
    },
  },
  password: {
    type: String,
    required: function () {
      return !this.snsId; // ✅ SNS 로그인 사용자는 비밀번호 불필요
    },
  },
  address: { type: String },
  phone: { type: String },
  role: {
    type: String,
    enum: ["user", "master", "admin", "manager", "rider"],
    default: "user",
    index: true,
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: function () {
      return this.role === "manager"; // ✅ manager일 때만 필수
    },
  },
  savedDeliveryInfo: {
    receiver: { type: String },
    phone: { type: String },
    address: { type: String },
    updatedAt: { type: Date },
  },
  snsProvider: { type: String }, // kakao, google, etc
  snsId: { type: String }, // ✅ 기존 필드 유지
  profile_image: { type: String}, // 프로필 이미지
  riderInfo: { type: RiderInfoSchema, required: false },
  createdAt: { type: Date, default: Date.now },
});



// ✅ 비밀번호 비교 메서드 (SNS 로그인 사용자는 password 없을 수 있음)
UserSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// ✅ 기존 모델이 있으면 재사용 (Hot Reload 방지)
export default mongoose.models.User || mongoose.model("User", UserSchema);
