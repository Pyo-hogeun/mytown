// routes/rider.js
import express from "express";
import User from "../models/user.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ 라이더 추가정보 등록
router.post("/register", authMiddleware, async (req, res) => {
  try {
    const { deliveryArea, settlementAccount, vehicleType } = req.body;

    // 현재 로그인된 사용자 가져오기
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    if (user.role !== "rider") {
      return res.status(403).json({ message: "라이더 전용 기능입니다." });
    }

    user.riderInfo = {
      deliveryArea,
      settlementAccount,
      vehicleType,
    };

    await user.save();

    res.json({ message: "라이더 정보 등록 완료", riderInfo: user.riderInfo });
  } catch (error) {
    console.error("라이더 등록 오류:", error);
    res.status(500).json({ message: "라이더 정보 등록 실패" });
  }
});

export default router;
