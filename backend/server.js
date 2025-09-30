// server.js
import cron from "node-cron";
import { generateWeeklySettlements } from "./jobs/settlementJob.js";

// 매주 월요일 01:00 실행
cron.schedule("0 1 * * 1", () => {
  console.log("📅 주간 정산 시작");
  generateWeeklySettlements();
});
