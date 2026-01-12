// geo.ts
import { Geolocation } from '@capacitor/geolocation';
import type { Position } from '@capacitor/geolocation';

// ✅ 위치 권한 요청 + 실시간 위치 추적 시작
export async function startWatchPosition(onPos: (pos: Position) => void) {
  await Geolocation.requestPermissions(); // 권한 요청
  const watchId = await Geolocation.watchPosition(
    { enableHighAccuracy: true, timeout: 10000 }, // 정확도/타임아웃
    (position, err) => {
      if (err || !position) return;
      onPos(position);
    }
  );

  return watchId; // stop할 때 필요
}

// ✅ 실시간 위치 추적 중지
export async function stopWatchPosition(watchId: string) {
  await Geolocation.clearWatch({ id: watchId });
}
