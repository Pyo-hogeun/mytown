import express from 'express';
import { authMiddleware, adminOnly } from '../middlewares/authMiddleware.js';
import { geocodeAddress } from '../services/geocode.js';

const router = express.Router();

/**
 * @openapi
 * /geocoding/geocode:
 *   post:
 *     summary: 주소를 위도/경도로 변환
 *     description: 관리자가 입력한 주소로 좌표를 조회합니다.
 *     tags:
 *       - Geocoding
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: 조회 성공
 *       400:
 *         description: 주소 누락
 *       404:
 *         description: 좌표를 찾을 수 없음
 *       502:
 *         description: 지오코딩 실패
 */
router.post('/geocode', authMiddleware, adminOnly, async (req, res) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ message: '주소를 입력해주세요.' });
  }

  try {
    const location = await geocodeAddress(address);

    if (!location) {
      return res.status(404).json({ message: '주소로 좌표를 찾을 수 없습니다.' });
    }

    res.json({ location });
  } catch (err) {
    res.status(502).json({ message: '주소 좌표 변환에 실패했습니다.', error: err.message });
  }
});

export default router;
