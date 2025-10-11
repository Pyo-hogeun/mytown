// app/login/kakao/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "@/utils/axiosInstance";

export default function KakaoCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      axios.get(`/auth/kakao/callback?code=${code}`).then((res) => {
        localStorage.setItem("token", res.data.token);
        router.push("/"); // 홈으로 리다이렉트
      });
    }
  }, [code]);

  return <p>카카오 로그인 처리중...</p>;
}
