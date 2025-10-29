"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";

export default function TestPage() {
  const [message, setMessage] = useState("서버 연결 중...");

  useEffect(() => {
    axios
      .get("/test")
      .then((res) => {
        setMessage(res.data.message);
      })
      .catch((err) => {
        console.error(err);
        setMessage("❌ 서버 연결 실패: " + err.message);
      });
  }, []);

  return (
    <div style={{ padding: 40, fontSize: 18 }}>
      <h2>🔍 백엔드 연결 테스트</h2>
      <p>{message}</p>
    </div>
  );
}
