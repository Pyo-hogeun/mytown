import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: "export",
  compiler: {
    // styled-components SSR 지원 활성화
    styledComponents: true,
  },

  images: {
    unoptimized: true,
    domains: ["picsum.photos", "placehold.co"], // 허용할 외부 이미지 도메인 추가
  },
};

export default nextConfig;
