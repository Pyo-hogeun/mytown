//인증라우터
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// 환경변수: process.env.JWT_SECRET 사용

// 회원가입
router.post('/signup', async (req, res) => {
  const { name, email, password, address, phone } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: '이미 가입된 이메일입니다.' });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      passwordHash: hashed,
      address,
      phone
    });

    await user.save();
    res.status(201).json({ message: '회원가입 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  console.log('login test');
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: '존재하지 않는 이메일입니다.' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
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
