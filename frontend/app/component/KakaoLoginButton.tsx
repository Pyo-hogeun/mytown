// components/KakaoLoginButton.tsx
"use client";
import React from "react";
import styled from "styled-components";
import Button from "./Button";
const StyledButton = styled(Button)`
  width: 100%;
  padding: 12px;
  font-weight: bold;
  color: white;
  border: none;
  border-radius: 8px;
`
const KakaoLoginButton = () => {
  const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_KEY!;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!;
  const scope = "profile_nickname,profile_image";

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code&prompt=login&scope=${scope}`;

  return (
    <a href={kakaoAuthUrl}>
      <StyledButton style={{ background: "#FEE500", padding: "10px 20px" }}>
        카카오로 로그인
      </StyledButton>
    </a>
  );
};

export default KakaoLoginButton;
