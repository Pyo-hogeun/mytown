//사용자
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  address: String,
  phone: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  createdAt: { type: Date, default: Date.now },
});
// 저장 전 비밀번호 해시
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
// 비밀번호 비교 메서드
UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};
module.exports = mongoose.model('User', UserSchema);
