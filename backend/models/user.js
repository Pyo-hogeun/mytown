// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 사용자 이름
  email: { type: String, unique: true, required: true }, // 이메일(로그인 ID)
  password: { type: String, required: true }, // 비밀번호(해시된 값)
  address: { type: String }, // 주소
  phone: { type: String }, // 전화번호
  role: {
    type: String,
    enum: ["user", "master", "admin", "manager", "rider"],
    default: "user",
    index: true,
  }, // 권한
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: function () {
      return this.role === "manager"; // manager일 때는 반드시 store 필요
    },
  }, // 📌 manager 소속 마트
  createdAt: { type: Date, default: Date.now }, // 생성일시
});

// 비밀번호 비교 메서드
UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// 기존 모델이 있으면 재사용 (Hot Reload 방지)
export default mongoose.models.User || mongoose.model("User", UserSchema);
