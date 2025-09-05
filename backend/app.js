import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; // 로컬 모듈은 .js 확장자 필요

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import storeRoutes from './routes/stores.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';
import { setupSwagger } from './swagger.js';
// import riderRoutes from './routes/riders.js';
// import reviewRoutes from './routes/reviews.js';

dotenv.config(); // 🔑 .env 로드
connectDB();     // 🧩 MongoDB 연결

const app = express();

// 미들웨어
app.use(cors({
  origin: 'http://localhost:3000', // 프론트엔드 주소
  credentials: true,               // 쿠키 등 인증이 필요한 경우
}));

app.use(express.json());

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
// app.use('/api/riders', riderRoutes);
// app.use('/api/reviews', reviewRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.send('🛒 Shopping Delivery API is running');
});

// Swagger UI
setupSwagger(app);

// 서버 시작
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
