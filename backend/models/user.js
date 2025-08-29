// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 사용자 이름
  email: { type: String, unique: true, required: true }, // 이메일(로그인 ID)
  password: { type: String, required: true }, // 비밀번호(해시된 값)
  address: { type: String }, // 주소
  phone: { type: String }, // 전화번호
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user', 
    index: true 
  }, // 권한 (user / admin)
  createdAt: { type: Date, default: Date.now }, // 생성일시
});

// 비밀번호 비교 메서드
UserSchema.methods.comparePassword = async function (candidate) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
