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
    enum: ['user', 'master', 'admin', 'manager', 'rider'],
    default: 'user',
    index: true
  }, // 권한 (user / master / admin / manager / rider)
  createdAt: { type: Date, default: Date.now }, // 생성일시
});

// 비밀번호 비교 메서드
UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', UserSchema);
