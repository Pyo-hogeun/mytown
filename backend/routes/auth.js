// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: 회원가입
 *     description: 새 사용자를 등록합니다. 기본 role은 `user`이며, 관리자 가입 코드를 입력하면 `admin` 권한을 가질 수 있습니다.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               name:
 *                 type: string
 *                 example: 홍길동
 *               roleCode:
 *                 type: string
 *                 example: "ADMIN_SECRET_CODE"
 *               roleTemp:
 *                 type: string
 *                 enum: [user, manager, admin]
 *                 example: user
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 650abcd1234ef567890abcd1
 *                 email:
 *                   type: string
 *                   example: test@example.com
 *                 name:
 *                   type: string
 *                   example: 홍길동
 *                 role:
 *                   type: string
 *                   example: user
 *       400:
 *         description: 회원가입 실패
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, roleCode, roleTemp } = req.body;

    let role = 'user';
    if (
      roleCode &&
      process.env.ADMIN_SIGNUP_CODE &&
      roleCode === process.env.ADMIN_SIGNUP_CODE
    ) {
      role = 'admin';
    }
    role = roleTemp || role; // roleTemp 값이 있으면 우선 적용

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      password: hashedPassword,
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
 * @openapi
 * /auth/login:
 *   post:
 *     summary: 로그인
 *     description: 사용자 로그인 후 JWT 토큰을 발급합니다. JWT payload에는 `{ id, email, role }`가 포함됩니다.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 로그인 성공, JWT 토큰 발급
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 650abcd1234ef567890abcd1
 *                     email:
 *                       type: string
 *                       example: test@example.com
 *                     name:
 *                       type: string
 *                       example: 홍길동
 *                     role:
 *                       type: string
 *                       example: user
 *       401:
 *         description: 인증 실패 (이메일 또는 비밀번호 오류)
 *       500:
 *         description: 서버 오류
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(401)
        .json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });

    const payload = { id: user._id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: '로그인 실패', error: err.message });
  }
});

export default router;
