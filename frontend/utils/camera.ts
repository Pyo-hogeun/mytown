// camera.ts
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

// ✅ 카메라로 사진 촬영 후 base64 or webPath 얻기
export async function takePhoto() {
  const photo = await Camera.getPhoto({
    quality: 80,                 // 사진 품질
    allowEditing: false,         // 편집 UI 여부
    resultType: CameraResultType.Uri, // 결과 타입(Uri/webPath)
    source: CameraSource.Camera, // 카메라 강제
  });

  return photo.webPath; // <img src="...">로 바로 표시 가능
}
