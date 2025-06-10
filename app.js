const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const connectDB = require('./config/db');

// DB 연결
connectDB();

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우트
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/riders', require('./routes/riders'));
app.use('/api/reviews', require('./routes/reviews'));

// 기본 라우트
app.get('/', (req, res) => {
  res.send('🛒 Shopping Delivery API is running');
});

module.exports = app;
