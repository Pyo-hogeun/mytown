// utils/generateTimeSlots.ts
export const generateTimeSlots = (selectedDayISO: string): string[] => {
  const slots: string[] = [];
  const startHour = 4; // 오전 4시
  const endHour = 17; // 오후 5시
  const interval = 30; // 30분 간격
  const now = new Date();

  const todayISO = now.toISOString().split("T")[0];
  const selectedDate = new Date(selectedDayISO);
  const selectedISO = selectedDate.toISOString().split("T")[0];

  // 오늘이면 주문시각 + 1시간부터 시작
  let startTime = new Date(selectedDate);
  startTime.setHours(startHour, 0, 0, 0);

  if (selectedISO === todayISO) {
    const currentPlus1H = new Date(now.getTime() + 60 * 60 * 1000);
    if (currentPlus1H > startTime) startTime = currentPlus1H;
  }

  // 시간대 생성 (30분 간격)
  const endTime = new Date(selectedDate);
  endTime.setHours(endHour, 30, 0, 0); // 17:30까지

  while (startTime <= endTime) {
    const hour = startTime.getHours();
    const minute = startTime.getMinutes();
    const ampm = hour < 12 ? "오전" : "오후";
    const displayHour = hour <= 12 ? hour : hour - 12;
    const timeLabel = `${ampm} ${displayHour}시${minute > 0 ? ` ${minute}분` : ""}`;
    slots.push(timeLabel);
    startTime.setMinutes(startTime.getMinutes() + interval);
  }

  return slots;
};
