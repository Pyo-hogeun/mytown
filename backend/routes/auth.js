// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from "axios";
import User from '../models/user.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     RiderInfo:
 *       type: object
 *       required:
 *         - deliveryArea
 *         - settlementAccount
 *         - vehicleType
 *       properties:
 *         deliveryArea:
 *           type: string
 *           example: "강남구 역삼동"
 *         settlementAccount:
 *           type: object
 *           properties:
 *             bankName:
 *               type: string
 *               example: "국민은행"
 *             accountNumber:
 *               type: string
 *               example: "123456-78-901234"
 *             verified:
 *               type: boolean
 *               example: true
 *         vehicleType:
 *           type: string
 *           enum: [motorcycle, car]
 *           example: motorcycle
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "650abcd1234ef567890abcd1"
 *         name:
 *           type: string
 *           example: "홍길동"
 *         email:
 *           type: string
 *           example: "hong@test.com"
 *         role:
 *           type: string
 *           enum: [user, admin, master, manager, rider]
 *         store:
 *           type: string
 *           example: "64c1234abc1234def5678901"
 *         riderInfo:
 *           $ref: "#/components/schemas/RiderInfo"
 */



/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: 회원가입
 *     tags: [Auth]
 *     description: 사용자 또는 관리자/라이더를 등록합니다.
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
 *                 example: user@test.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               name:
 *                 type: string
 *                 example: 홍길동
 *               roleTemp:
 *                 type: string
 *                 enum: [user, manager, admin, rider, master]
 *                 example: rider
 *               roleCode:
 *                 type: string
 *                 description: 관리자 가입 시 필요
 *                 example: ADMIN_SECRET_CODE
 *               storeId:
 *                 type: string
 *                 description: manager 가입 시 필요
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
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

    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      password,
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
 *     tags: [Auth]
 *     description: 이메일/비밀번호로 로그인하여 JWT 토큰을 발급받습니다.
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
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: "#/components/schemas/User"
 *       401:
 *         description: 이메일 또는 비밀번호 오류
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // store populate 추가
    const user = await User.findOne({ email }).select("+password").populate("store");
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
        // rider라면, 라이더정보 응답
        riderInfo: user.role === "rider" ? user.riderInfo : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: '로그인 실패', error: err.message });
  }
});

/**
 * @openapi
 * /auth/kakao/callback:
 *   get:
 *     summary: 카카오 로그인 콜백
 *     tags: [Auth]
 *     description: 카카오 인증 후 사용자 정보를 받아 JWT 토큰을 발급합니다.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         description: 카카오에서 전달한 인가 코드
 *         schema:
 *           type: string
 *           example: "abc1234xyz"
 *     responses:
 *       200:
 *         description: 카카오 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: "#/components/schemas/User"
 *       500:
 *         description: 카카오 로그인 실패
 */

router.get("/kakao/callback", async (req, res) => {
  const { code } = req.query;

  try {
    // 1. 토큰 요청
    const tokenRes = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.KAKAO_REST_KEY,
          redirect_uri: process.env.KAKAO_REDIRECT_URI,
          code: code,
        },
        headers: { "Content-type": "application/x-www-form-urlencoded;charset=utf-8" },
      }
    );

    const { access_token } = tokenRes.data;

    // 2. 사용자 정보 요청
    const userRes = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const kakaoUser = userRes.data;

    const kakaoId = kakaoUser.id.toString();
    const email = kakaoUser.kakao_account?.email || `${kakaoId}@kakao-user.com`;
    const name = kakaoUser.properties?.nickname || '카카오사용자';
    const profile_image = kakaoUser.properties?.profile_image || '';

    // 3. DB 조회 및 생성
    let user = await User.findOne({ snsProvider: "kakao", snsId: kakaoId });

    if (!user) {
      user = await User.create({
        name,
        email,
        snsProvider: "kakao",
        snsId: kakaoId,
        profile_image
      });
    }

    // 4. JWT 발급
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // 프론트로 토큰 전달 (redirect or json)
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: 'user',
      }
    });

  } catch (err) {
    console.error('❌ 카카오 로그인 실패:', err.response?.data || err.message);
    res.status(500).json({
      message: '카카오 로그인 실패',
      error: err.response?.data || err,
    });
  }
});

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: 내 정보 조회
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       500:
 *         description: 사용자 정보를 불러오지 못했습니다.
 */


router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("store")
      .lean();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "사용자 정보를 불러오지 못했습니다." });
  }
});

/**
 * @swagger
 * /api/auth/password:
 *   patch:
 *     summary: 로그인된 사용자의 비밀번호 변경
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: 비밀번호 변경 성공
 *       400:
 *         description: 현재 비밀번호가 올바르지 않음
 *       401:
 *         description: 인증 필요
 */
router.patch("/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    // ✅ 비밀번호 변경 시에만 password 필드 포함해서 조회
    const user = await User.findById(req.user._id).select('+password');

    if (!user) return res.status(404).json({ message: "사용자 없음" });

    if (user.snsProvider)
      return res.status(400).json({ message: "SNS 계정은 비밀번호 변경이 불가합니다." });

    if (!user.password) {
      return res.status(400).json({ message: '비밀번호 정보가 없습니다.' });
    }



    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "현재 비밀번호가 올바르지 않습니다." });

    user.password = newPassword
    await user.save();

    res.json({ message: "비밀번호 변경 완료" });
  } catch (err) {
    console.error("비밀번호 변경 오류:", err);
    res.status(500).json({ message: "비밀번호 변경 실패" });
  }
});


export default router;
