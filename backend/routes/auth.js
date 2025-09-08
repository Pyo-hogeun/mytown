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
 *     description: |
 *       새 사용자를 등록합니다.  
 *       - 기본 `role`은 `user`입니다.  
 *       - `roleTemp`가 `admin`인 경우, 관리자 코드(`ADMIN_SIGNUP_CODE`)와 일치하면 `admin`으로 가입할 수 있습니다.  
 *       - `roleTemp`가 `manager`인 경우, 반드시 `storeId` 필드를 포함해야 하며 **하나의 매장(store)만 연결**됩니다.  
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
 *               - roleTemp
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
 *               roleTemp:
 *                 type: string
 *                 enum: [user, manager, admin, rider, master]
 *                 example: user
 *               roleCode:
 *                 type: string
 *                 description: 관리자 가입 시 필요한 코드
 *                 example: "ADMIN_SECRET_CODE"
 *               storeId:
 *                 type: string
 *                 description: |
 *                   `roleTemp`가 `manager`일 때 **필수**입니다.  
 *                   선택한 마트(Store)의 `_id` 값을 전달해야 하며, 하나만 연결할 수 있습니다.
 *                 example: "64c1234abc1234def5678901"
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
 *                   example: manager
 *                 store:
 *                   type: string
 *                   example: 64c1234abc1234def5678901
 *       400:
 *         description: 회원가입 실패
 */

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, roleCode, roleTemp, storeId } = req.body;

    let role = 'user';
    if (
      roleCode &&
      process.env.ADMIN_SIGNUP_CODE &&
      roleCode === process.env.ADMIN_SIGNUP_CODE
    ) {
      role = 'admin';
    }
    role = roleTemp || role; // roleTemp 값이 있으면 우선 적용

    // 📌 manager인 경우 storeId 필수
    if (role === 'manager' && !storeId) {
      return res.status(400).json({ message: 'manager 가입 시 storeId가 필요합니다.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      password: hashedPassword,
      name,
      role,
      store: role === 'manager' ? storeId : undefined, // storeId 저장
    });

    await user.save();

    res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      store: user.store ?? null,
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
 *     description: 사용자 로그인 후 JWT 토큰을 발급합니다. JWT payload에는 `{ id, email, role, store }`가 포함됩니다.
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
 *       401:
 *         description: 인증 실패 (이메일 또는 비밀번호 오류)
 *       500:
 *         description: 서버 오류
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // store populate 추가
    const user = await User.findOne({ email }).populate("store");
    if (!user)
      return res
        .status(401)
        .json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      store: user.store ? user.store._id : null, // JWT에는 _id만
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        // manager라면 store 전체 정보 응답
        store: user.role === "manager" ? user.store : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: '로그인 실패', error: err.message });
  }
});


export default router;
