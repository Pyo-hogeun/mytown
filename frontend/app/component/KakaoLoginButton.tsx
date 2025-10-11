// components/KakaoLoginButton.tsx
"use client";
import React from "react";

const KakaoLoginButton = () => {
  const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_KEY!;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!;
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code&prompt=login`;

  return (
    <a href={kakaoAuthUrl}>
      <button style={{ background: "#FEE500", padding: "10px 20px" }}>
        카카오로 로그인
      </button>
    </a>
  );
};

export default KakaoLoginButton;
