// routes/auth.js
// 회원가입/로그인 라우터: JWT에 role 포함
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

/**
 * 회원가입
 * - 기본 role은 'user'
 * - (선택) ADMIN_SIGNUP_CODE가 일치하면 'admin' 부여
 */
// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, roleCode } = req.body;

    // 관리자 코드 확인
    let role = 'user';
    if (
      roleCode &&
      process.env.ADMIN_SIGNUP_CODE &&
      roleCode === process.env.ADMIN_SIGNUP_CODE
    ) {
      role = 'admin';
    }

    // 비밀번호 해싱 (router에서 직접)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 새로운 유저 생성
    const user = new User({
      email,
      password: hashedPassword, // ✅ 해싱된 비밀번호 저장
      name,
      role,
    });

    await user.save();

    res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    res.status(400).json({ message: '회원가입 실패', error: err.message });
  }
});

/**
 * 로그인
 * - JWT payload에 { id, email, role } 포함
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });

    const payload = { id: user._id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: '로그인 실패', error: err.message });
  }
});

module.exports = router;
