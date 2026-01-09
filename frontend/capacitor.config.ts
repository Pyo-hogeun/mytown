import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mytown.app",
  appName: "MyTown",
  webDir: "public",
  server: {
    url: "https://mytown-ruby.vercel.app",
    cleartext: false,
  },
};

export default config;
