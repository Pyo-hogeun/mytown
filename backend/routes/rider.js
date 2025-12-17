// routes/rider.js
import express from "express";
import User from "../models/user.js";
import Store from "../models/store.js";
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
      status: "AVAILABLE",
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

// 매니저가 배정 가능한 라이더 목록 조회
router.get("/available", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "매니저만 라이더 목록을 조회할 수 있습니다." });
    }

    const store = await Store.findById(req.user.store);
    const storeLocation = store?.location;
    const hasStoreLocation =
      typeof storeLocation?.lat === "number" && typeof storeLocation?.lng === "number";

    const riders = await User.find({
      role: "rider",
      "riderInfo.status": "AVAILABLE",
    }).select("name phone riderInfo");

    const ridersWithDistance = riders.map((rider) => {
      const riderObj = rider.toObject();
      const riderLocation = riderObj.riderInfo?.location;
      const hasRiderLocation =
        typeof riderLocation?.lat === "number" && typeof riderLocation?.lng === "number";
      const distanceFromStore =
        hasStoreLocation && hasRiderLocation
          ? calculateDistanceKm(
              { lat: storeLocation.lat, lng: storeLocation.lng },
              { lat: riderLocation.lat, lng: riderLocation.lng }
            )
          : null;

      return {
        ...riderObj,
        distanceFromStore,
      };
    });

    res.json({ riders: ridersWithDistance, storeLocation });
  } catch (error) {
    console.error("라이더 조회 오류:", error);
    res.status(500).json({ message: "라이더 조회 실패" });
  }
});

// 라이더 현재 위치 업데이트
router.patch("/location", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "rider") {
      return res.status(403).json({ message: "라이더만 위치를 업데이트할 수 있습니다." });
    }

    const { lat, lng } = req.body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ message: "위도(lat)와 경도(lng)를 숫자로 전달해주세요." });
    }

    const rider = await User.findById(req.user._id);
    if (!rider) {
      return res.status(404).json({ message: "라이더 정보를 찾을 수 없습니다." });
    }

    rider.riderInfo = rider.riderInfo || {};
    rider.riderInfo.location = {
      lat,
      lng,
      updatedAt: new Date(),
    };
    rider.markModified("riderInfo");
    await rider.save();

    res.json({
      message: "라이더 위치가 업데이트되었습니다.",
      location: rider.riderInfo.location,
    });
  } catch (error) {
    console.error("라이더 위치 업데이트 오류:", error);
    res.status(500).json({ message: "라이더 위치 업데이트에 실패했습니다." });
  }
});

const calculateDistanceKm = (
  from,
  to
) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 소수점 1자리까지 반올림
};

export default router;
