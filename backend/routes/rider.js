// routes/rider.js
import express from "express";
import User from "../models/user.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Rider
 *     description: 라이더 관련 API
 */

/**
 * @openapi
 * /rider/register:
 *   post:
 *     summary: 라이더 추가정보 등록
 *     description: |
 *       로그인한 라이더가 본인의 **추가 정보를 등록**합니다.  
 *       등록된 정보는 `User.riderInfo` 필드에 저장되며,  
 *       `auth/me` 또는 로그인 시 응답 객체에서 확인할 수 있습니다.
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliveryArea
 *               - settlementAccount
 *               - vehicleType
 *             properties:
 *               deliveryArea:
 *                 type: string
 *                 example: "강남구 역삼동"
 *               settlementAccount:
 *                 type: object
 *                 required:
 *                   - bankName
 *                   - accountNumber
 *                 properties:
 *                   bankName:
 *                     type: string
 *                     example: "국민은행"
 *                   accountNumber:
 *                     type: string
 *                     example: "123456-78-901234"
 *               vehicleType:
 *                 type: string
 *                 enum: [motorcycle, car]
 *                 example: motorcycle
 *     responses:
 *       200:
 *         description: 라이더 정보 등록 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "라이더 정보 등록 완료"
 *                 riderInfo:
 *                   $ref: "#/components/schemas/RiderInfo"
 *       403:
 *         description: 라이더 권한이 없는 경우
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류 또는 저장 실패
 */

router.post("/register", authMiddleware, async (req, res) => {
  try {
    const { deliveryArea, settlementAccount, vehicleType } = req.body;

    // 현재 로그인된 사용자 가져오기
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    if (user.role !== "rider") {
      return res.status(403).json({ message: "라이더 전용 기능입니다." });
    }

    user.riderInfo = {
      deliveryArea,
      settlementAccount,
      vehicleType,
    };

    await user.save();

    res.json({
      message: "라이더 정보 등록 완료",
      riderInfo: user.riderInfo,
    });
  } catch (error) {
    console.error("라이더 등록 오류:", error);
    res.status(500).json({ message: "라이더 정보 등록 실패" });
  }
});

export default router;
