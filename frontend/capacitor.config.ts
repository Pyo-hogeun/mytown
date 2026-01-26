import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mytown.app",
  appName: "MyTown",
  webDir: "out",
  server: {
    url: "https://mytown-ruby.vercel.app",
    cleartext: false,
    // ✅ 외부 도메인 네비게이션/접근 허용(필수로 넣어보는 걸 추천)
    allowNavigation: [
      'mytown-ruby.vercel.app',
      'mytown-myui.onrender.com',
    ],
  },
};

export default config;
