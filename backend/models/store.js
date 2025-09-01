//마트상점
import mongoose from "mongoose";
const StoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 해당 마트 관리자
  phone: { type: String },                // 옵션: 전화번호
}, {
  timestamps: true
});

export default mongoose.model('Store', StoreSchema);
