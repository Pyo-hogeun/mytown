'use client';

import React, { useEffect, useState } from 'react';
import Tabs from '@/app/component/Tabs';
import AvailableOrdersPage from '@/app/rider/availableOrders/page';
import RiderOrdersPage from '@/app/rider/order/page';
import axios from '@/utils/axiosInstance';
import Settlement from './settlement/page';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const RiderHome = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get("tab") as 'available' | 'assigned' | 'settlement') || 'available';

  const [activeKey, setActiveKey] = useState<'available' | 'assigned' | 'settlement'>(initialTab);
  const [hasAssignedOrders, setHasAssignedOrders] = useState(false);
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
          setHasAssignedOrders(true);
        }
      } catch (err) {
        console.error('배정된 주문 확인 실패:', err);
      }
    };
    fetchAssignedOrders();
  }, []);

  const tabs = [
    { key: 'available', label: '배정 전 주문' },
    { key: 'assigned', label: '배정된 주문' },
    { key: 'settlement', label: '정산내역' },
  ];

  return (
    <div>
      <Tabs tabs={tabs} activeKey={activeKey} onChange={(key) => setActiveKey(key as 'available' | 'assigned' | 'settlement')} />
      <div>
        {activeKey === 'available' && <AvailableOrdersPage />}
        {activeKey === 'assigned' && <RiderOrdersPage />}
        {activeKey === 'settlement' && <Settlement />}
      </div>
    </div>
  );
};

export default RiderHome;
