// MongoDB 연결 전용 파일
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);

    console.log('✅ MongoDB 연결 성공');
  } catch (err) {
    console.error('❌ MongoDB 연결 실패:', err.message);
    process.exit(1); // 서버 종료
  }
};

module.exports = connectDB;
