import axios from 'axios';

const DEFAULT_ENDPOINT = "https://dapi.kakao.com/v2/local/search/address.json";
const GEOCODER_ENDPOINT = process.env.GEOCODING_ENDPOINT || DEFAULT_ENDPOINT;

export async function geocodeAddress(address) {
  if (!address) {
    return null;
  }

  const endpoint = GEOCODER_ENDPOINT;

  try {
    const { data } = await axios.get(endpoint, {
      params: { query: address },
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_REST_KEY}`,
      },
    });

    const doc = res.data.documents[0];
    if (!doc) throw new Error("주소를 좌표로 변환할 수 없습니다.");

    return {
      lat: Number(doc.address.y),
      lng: Number(doc.address.x),
    };

    return null;
  } catch (err) {
    console.error('Geocoding lookup failed:', err.message);
    throw new Error('geocoding_failed');
  }
}
