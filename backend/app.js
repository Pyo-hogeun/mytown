const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config(); // 🔑 .env 로드
connectDB();     // 🧩 MongoDB 연결

const app = express();

// 미들웨어

// ✅ 프리플라이트 OPTIONS 요청 허용
// app.options('*', cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
// }));

//CORS 설정
app.use(cors({
  origin: 'http://localhost:3000', // 프론트엔드 주소
  credentials: true,              // 쿠키 등 인증이 필요한 경우
}));
app.use(express.json());

// 라우트
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/stores', require('./routes/stores'));
app.use('/api/products', require('./routes/products'));
// app.use('/api/orders', require('./routes/orders'));
// app.use('/api/riders', require('./routes/riders'));
// app.use('/api/reviews', require('./routes/reviews'));

// 기본 라우트
app.get('/', (req, res) => {
  res.send('🛒 Shopping Delivery API is running');
});

// 서버 시작
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
