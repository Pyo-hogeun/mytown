//인증라우터
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// 환경변수: process.env.JWT_SECRET 사용

// 📌 회원가입 API
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 📌 이미 등록된 이메일인지 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });

    // 📌 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📌 새 사용자 생성
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: '회원가입 성공' });
  } catch (err) {
    res.status(500).json({ message: '회원가입 실패', error: err.message });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  console.log('login test');
  const { email, password } = req.body;
  console.log(email, password);
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: '존재하지 않는 이메일입니다.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });

    const token = jwt.sign(
      { userId: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
