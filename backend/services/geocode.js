import axios from 'axios';

const DEFAULT_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const GEOCODER_ENDPOINT = process.env.GEOCODING_ENDPOINT || DEFAULT_ENDPOINT;

export async function geocodeAddress(address) {
  if (!address) {
    return null;
  }

  const endpoint = GEOCODER_ENDPOINT;

  try {
    const { data } = await axios.get(endpoint, {
      params: {
        q: address,
        format: 'json',
        addressdetails: 1,
        limit: 1,
      },
      headers: {
        'User-Agent': 'mytown-geocoder/1.0',
      },
    });

    if (Array.isArray(data) && data.length > 0) {
      const { lat, lon } = data[0];
      const parsedLat = Number(lat);
      const parsedLng = Number(lon);

      if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)) {
        return { lat: parsedLat, lng: parsedLng };
      }
    }

    return null;
  } catch (err) {
    console.error('Geocoding lookup failed:', err.message);
    throw new Error('geocoding_failed');
  }
}
