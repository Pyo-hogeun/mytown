// routes/stores.js

import express from 'express';
import Store from '../models/store.js';
import { authMiddleware, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @openapi
 * /stores:
 *   post:
 *     summary: 마트 등록 (관리자 전용)
 *     description: 관리자가 새로운 마트를 등록합니다.
 *     tags:
 *       - Store
 *     security:
 *       - bearerAuth: []   # JWT 인증 필요
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: "행복마트"
 *               address:
 *                 type: string
 *                 example: "서울시 강남구 테헤란로 123"
 *               phone:
 *                 type: string
 *                 example: "02-1234-5678"
 *     responses:
 *       201:
 *         description: 마트 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       400:
 *         description: 이미 마트를 등록한 사용자
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 관리자 권한 없음
 *       500:
 *         description: 서버 오류
 */
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { name, address, phone } = req.body;
  const userId = req.user.id;

  try {
    const store = new Store({ name, address, owner: userId, phone });
    await store.save();
    res.status(201).json(store);
  } catch (err) {
    res.status(500).json({ message: '마트 등록 실패', error: err.message });
  }
});

/**
 * @openapi
 * /stores:
 *   get:
 *     summary: 전체 마트 목록 조회
 *     tags:
 *       - Store
 *     responses:
 *       200:
 *         description: 마트 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Store'
 *       500:
 *         description: 서버 오류
 */
router.get('/', async (req, res) => {
  try {
    const stores = await Store.find();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: '마트 조회 실패', error: err.message });
  }
});

export default router;
