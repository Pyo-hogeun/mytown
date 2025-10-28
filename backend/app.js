// app.js
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
import settlementRoutes from './routes/settlement.js';
import riderRoutes from './routes/rider.js';
import { setupSwagger } from './swagger.js';
import reviewRoutes from './routes/review.js';
import mongoose from 'mongoose';

dotenv.config(); // 🔑 .env 로드

const app = express();

// ----------------- 설정: CORS -----------------
// CORS_ORIGINS 예시: "https://yourapp.vercel.app, http://localhost:3000"
const originsEnv = process.env.CORS_ORIGINS || 'http://localhost:3000';
const allowedOrigins = originsEnv.split(',').map((s) => s.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      // origin이 없으면 (서버사이 호출 또는 Postman) 허용
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// 기본 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 헬스 체크 (Render health check에 사용)
app.get('/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development', time: new Date().toISOString() });
});

// ----------------- 라우트 -----------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/settlement', settlementRoutes);
app.use('/api/rider', riderRoutes);
app.use('/api/reviews', reviewRoutes);

// Swagger (엔드포인트는 라우트 등록 후)
setupSwagger(app);

// 기본 라우트
app.get('/', (req, res) => {
  res.send('🛒 Shopping Delivery API is running');
});

// ----------------- 서버 시작 (비동기 초기화) -----------------
const PORT = process.env.PORT;

async function start() {
  try {
    // MongoDB 연결 (connectDB가 Promise 반환한다고 가정)
    await connectDB();
    console.log('✅ MongoDB 연결 시도 완료');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server listening on port ${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
    });

    // graceful shutdown
    const graceful = async (signal) => {
      console.info(`${signal} received — closing server`);
      server.close(async () => {
        try {
          await mongoose.disconnect();
          console.info('MongoDB disconnected, exiting process');
          process.exit(0);
        } catch (err) {
          console.error('Error during disconnect', err);
          process.exit(1);
        }
      });

      // 강제 종료 타임아웃
      setTimeout(() => {
        console.warn('Forcing shutdown');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGINT', () => graceful('SIGINT'));
    process.on('SIGTERM', () => graceful('SIGTERM'));
  } catch (err) {
    console.error('앱 시작 중 에러 발생:', err);
    process.exit(1);
  }
}

start();
