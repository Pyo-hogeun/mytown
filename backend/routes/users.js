import express from "express";
import User from '../models/user.js';
import { authMiddleware, adminOnly } from '../middlewares/authMiddleware.js';
const router = express.Router();

// 사용자 목록 조회 (관리자만 가능)
router.get("/", async (req, res) => {
  try {
    // role 검사 로직이 있다면 추가 (예: req.user.role === 'admin')
    const users = await User.find().select("-password"); // password 제외
    res.json(users);
  } catch (error) {
    console.error("사용자 목록 조회 실패:", error);
    res.status(500).json({ message: "사용자 목록 조회 실패" });
  }
});

// role 변경 (관리자 전용)
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

export default router;
