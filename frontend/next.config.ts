import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    // styled-components SSR 지원 활성화
    styledComponents: true,
  },
};

export default nextConfig;
