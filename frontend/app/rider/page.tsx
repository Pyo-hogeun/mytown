'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Tabs from '@/app/component/Tabs';
import AvailableOrdersPage from '@/app/rider/availableOrders/page';
import RiderOrdersPage from '@/app/rider/order/page';
import axios from '@/utils/axiosInstance';
import Settlement from './settlement/page';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { updateRiderLocation } from '@/redux/slices/authSlice';

const RiderHomeContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const initialTab = (searchParams.get("tab") as 'available' | 'assigned' | 'settlement') || 'available';

  const [activeKey, setActiveKey] = useState<'available' | 'assigned' | 'settlement'>(initialTab);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  // 🚀 최초 로딩 시 배정된 주문 여부 확인
  useEffect(() => {
    if (user && !user.riderInfo) {
      router.push(`/rider/register?user=${encodeURIComponent(user?.email)}`);
      return;
    }
    const fetchAssignedOrders = async () => {
      try {
        const res = await axios.get('/order/rider/assigned');
        if (res.data.orders && res.data.orders.length > 0 && !searchParams.get('tab')) {
          setActiveKey('assigned'); // 배정된 주문 있으면 바로 해당 탭 활성화
        }
      } catch (err) {
        console.error('배정된 주문 확인 실패:', err);
      }
    };
    fetchAssignedOrders();
  }, []);

  const getLocationErrorMessage = (error: GeolocationPositionError) => {
    if (error.code === error.PERMISSION_DENIED) {
      return '위치 권한을 확인해주세요.';
    }

    if (error.code === error.POSITION_UNAVAILABLE) {
      return '현재 위치를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.';
    }

    if (error.code === error.TIMEOUT) {
      return '위치 확인 시간이 초과되었습니다. 다시 시도해주세요.';
    }

    return '위치 정보를 가져오지 못했습니다. 다시 시도해주세요.';
  };

  const handleManualLocationUpdate = () => {
    setLocationStatus(null);
    if (!navigator.geolocation) {
      setLocationStatus('현재 브라우저에서는 위치 정보를 사용할 수 없습니다.');
      return;
    }

    setIsUpdatingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await dispatch(
            updateRiderLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          ).unwrap();
          setLocationStatus('현재 위치가 업데이트되었습니다.');
        } catch {
          setLocationStatus('위치 업데이트에 실패했습니다.');
        } finally {
          setIsUpdatingLocation(false);
        }
      },
      (error) => {
        setLocationStatus(getLocationErrorMessage(error));
        setIsUpdatingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const tabs = [
    { key: 'available', label: '배정 전 주문' },
    { key: 'assigned', label: '배정된 주문' },
    { key: 'settlement', label: '정산내역' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <button onClick={handleManualLocationUpdate} disabled={isUpdatingLocation}>
          {isUpdatingLocation ? '위치 업데이트 중...' : '현재 위치 업데이트'}
        </button>
        {locationStatus && <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>{locationStatus}</p>}
      </div>
      <Tabs tabs={tabs} activeKey={activeKey} onChange={(key) => setActiveKey(key as 'available' | 'assigned' | 'settlement')} />
      <div>
        {activeKey === 'available' && <AvailableOrdersPage />}
        {activeKey === 'assigned' && <RiderOrdersPage />}
        {activeKey === 'settlement' && <Settlement />}
      </div>
    </div>
  );
};

export default function RiderHome(){
  return(
    <Suspense fallback={<div>로딩중...</div>}>
      <RiderHomeContent />
    </Suspense>
  )
};
