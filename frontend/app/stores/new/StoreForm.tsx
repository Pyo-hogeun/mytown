'use client';

import styled from 'styled-components';
import { useState } from 'react';
import axios from '@/utils/axiosInstance';
import { useRouter } from 'next/navigation';

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  margin-top: 1rem;
  padding: 0.6rem 1rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 6px;
`;

const StoreForm = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const location = lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined;

      await axios.post('/stores', { name, address, phone, location });
      alert('마트 등록 성공');
      router.push('/stores');
    } catch (err: any) {
      console.error('마트 등록 실패', err.response?.data || err.message);
      alert(err.response?.data?.message || '마트 등록 실패');
    }
  };

  const requestGeocode = async () => {
    if (!address.trim()) {
      alert('주소를 입력해주세요.');
      return;
    }

    setIsGeocoding(true);
    try {
      const { data } = await axios.post('/geocoding/geocode', { address });
      if (data?.location) {
        setLat(String(data.location.lat));
        setLng(String(data.location.lng));
      }
    } catch (err: any) {
      console.error('주소 좌표 변환 실패', err.response?.data || err.message);
      alert(err.response?.data?.message || '주소 좌표 변환에 실패했습니다.');
    } finally {
      setIsGeocoding(false);
    }
  };


  return (<>
    <h1>🏬 마트 등록 (관리자 전용)</h1>
    <form onSubmit={handleSubmit}>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="마트 이름" required />
      <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="주소" />
      <Button type="button" onClick={requestGeocode} disabled={isGeocoding}>
        {isGeocoding ? '주소 변환 중...' : '주소로 좌표 찾기'}
      </Button>
      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="전화번호" />
      <Input
        type="number"
        value={lat}
        onChange={(e) => setLat(e.target.value)}
        placeholder="위도 (예: 37.5665)"
        step="0.000001"
      />
      <Input
        type="number"
        value={lng}
        onChange={(e) => setLng(e.target.value)}
        placeholder="경도 (예: 126.9780)"
        step="0.000001"
      />
      <Button type="submit">등록하기</Button>
    </form>
  </>
  );
}
export default StoreForm
