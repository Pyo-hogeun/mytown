'use client';

import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export const useRequireLogin = () => {
  const router = useRouter();
  const pathname = usePathname(); // 현재 경로 가져오기
  const { token } = useSelector((state: RootState) => state.auth);

  const requireLogin = (callback: () => void) => {
    if (!token) {
      // 로그인 후 다시 돌아올 경로를 redirect 파라미터로 전달
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else {
      callback();
    }
  };

  return { requireLogin };
};
