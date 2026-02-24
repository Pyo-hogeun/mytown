// app/login/kakao/callback/page.tsx
"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "@/utils/axiosInstance";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "@/redux/slices/authSlice";

const KakaoCallbackContent = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      axios.get(`/auth/kakao/callback?code=${code}`).then((res) => {
        localStorage.setItem("token", res.data.token);

        dispatch(setUser(res.data.user));
        dispatch(setToken(res.data.token));

        const targetPath = res.data.user?.role === "rider" ? "/rider" : "/products";
        router.replace(targetPath);
      });

    }
  }, [code, dispatch, router]);

  return <p>카카오 로그인 처리중...</p>;
}
export default function KakaoCallback(){
  return(
    <Suspense fallback={<div>로딩중...</div>}>
      <KakaoCallbackContent />
    </Suspense>
  )
}