import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mytown.app",
  appName: "MyTown",
  webDir: "out",
  bundledWebRuntime: false,
  server: {
    url: "http://localhost:3001",
    cleartext: true,
  },
};

export default config;
