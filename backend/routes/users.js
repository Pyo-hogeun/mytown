// routes/users.js
import express from "express";
import User from '../models/user.js';
import { authMiddleware, adminOnly } from '../middlewares/authMiddleware.js';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 관리 API
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: 사용자 목록 조회 (관리자만 가능)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   email:
 *                     type: string
 *                   name:
 *                     type: string
 *                   role:
 *                     type: string
 *                     enum: [user, admin]
 *       403:
 *         description: 권한 없음
 *       500:
 *         description: 서버 오류
 */
router.get("/", async (req, res) => {
  try {
    const { name, email, role, phone, address } = req.query;
    const filter = {};

    if (name) filter.name = new RegExp(name, "i"); // 부분일치 검색
    if (email) filter.email = new RegExp(email, "i");
    if (role) filter.role = role;
    if (phone) filter.phone = new RegExp(phone, "i");
    if (address) filter.address = new RegExp(address, "i");

    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (error) {
    console.error("사용자 목록 조회 실패:", error);
    res.status(500).json({ message: "사용자 목록 조회 실패" });
  }
});

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: 사용자 권한 변경 (관리자 전용)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 사용자 ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: 권한 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: [user, admin]
 *       400:
 *         description: 잘못된 role 값
 *       404:
 *         description: 해당 사용자 없음
 *       500:
 *         description: 서버 오류
 */
router.patch('/:id/role', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Role update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// ✅ 저장된 배송지 자동 불러오기
router.get("/saved-delivery", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("savedDeliveryInfo");

    if (!user || !user.savedDeliveryInfo) {
      return res.status(200).json({
        message: "저장된 배송지가 없습니다.",
        savedDeliveryInfo: null,
      });
    }

    return res.json({
      message: "저장된 배송지 불러오기 성공",
      savedDeliveryInfo: user.savedDeliveryInfo,
    });
  } catch (err) {
    console.error("배송지 불러오기 오류:", err);
    return res.status(500).json({ message: err.message });
  }
});

export default router;
