// routes/payment.js
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST 요청을 받는 /payments/complete
router.post("/complete", async (req, res) => {
  console.log('완료 요청');
  try {
    // 요청의 body로 paymentId가 오기를 기대합니다.
    const { paymentId, order, amount } = req.body;
    if (!paymentId) return res.status(400).json({ message: "paymentId 누락" });
    console.log("결제 완료 요청 수신:", paymentId);

    

    // 1️⃣ PortOne API에서 결제 단건 조회
    const paymentResponse = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `PortOne ${process.env.PORT_API_SECRET}`,
          "Content-Type": "application/json",
        },
      },
    );
    const payment = await paymentResponse.json();
    console.log("PortOne 결제 조회 결과:", payment);
    if (payment.status === 'FAILED') {
      return res.status(400).json({
        message: "PortOne 결제 조회 실패",
        detail: payment,
      });
    }

    // 2️⃣ 금액 검증
    if (payment.amount.total !== amount) {
      return res.status(401).json({
        message: "결제 금액 불일치",
        paid: payment.amount.total,
        expected: amount,
      });
    }

    // 3️⃣ 결제 상태 확인
    if (payment.status === "PAID") {
      console.log("결제 완료 처리됨:", paymentId);
      return res.json({
        status: "PAID",
        paymentId,
        amount: payment.amount.total,
      });
    } else {
      return res.json({
        status: payment.status,
        paymentId,
        message: "아직 결제가 완료되지 않았습니다.",
      });
    }
  } catch (err) {
    console.error("❌ 결제 검증 오류:", err);
    res.status(500).json({ message: err.message });
  }
});
export default router;