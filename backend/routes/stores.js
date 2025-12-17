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
  const { name, address, phone, location } = req.body;
  const userId = req.user.id;

  try {
    const coords = {};

    if (location) {
      const { lat, lng } = location;

      if (lat !== undefined && lng !== undefined) {
        const parsedLat = Number(lat);
        const parsedLng = Number(lng);

        if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
          return res.status(400).json({ message: '위도/경도는 숫자여야 합니다.' });
        }

        coords.location = { lat: parsedLat, lng: parsedLng };
      }
    }

    const store = new Store({ name, address, owner: userId, phone, ...coords });
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

/**
 * @openapi
 * /stores/{id}/location:
 *   put:
 *     summary: 매장 위치 정보 업데이트
 *     tags:
 *       - Store
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 업데이트할 매장 ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *     responses:
 *       200:
 *         description: 업데이트된 매장 정보
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 매장을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.put('/:id/location', authMiddleware, adminOnly, async (req, res) => {
  const { address, location } = req.body;
  const update = {};

  if (address !== undefined) {
    update.address = address;
  }

  if (location) {
    const { lat, lng } = location;

    if (lat !== undefined && lng !== undefined) {
      const parsedLat = Number(lat);
      const parsedLng = Number(lng);

      if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
        return res.status(400).json({ message: '위도/경도는 숫자여야 합니다.' });
      }

      update.location = { lat: parsedLat, lng: parsedLng };
    }
  }

  if (!Object.keys(update).length) {
    return res.status(400).json({ message: '업데이트할 항목이 없습니다.' });
  }

  try {
    const store = await Store.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!store) {
      return res.status(404).json({ message: '해당 매장을 찾을 수 없습니다.' });
    }

    res.json(store);
  } catch (err) {
    res.status(500).json({ message: '매장 위치 업데이트 실패', error: err.message });
  }
});

export default router;
