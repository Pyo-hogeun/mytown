'use client';

import React, { useEffect, useState } from 'react';
import Tabs from '@/app/component/Tabs';
import AvailableOrdersPage from '@/app/rider/availableOrders/page';
import RiderOrdersPage from '@/app/rider/order/page';
import axios from '@/utils/axiosInstance';

const RiderHome = () => {
  const [activeKey, setActiveKey] = useState<'available' | 'assigned'>('available');
  const [hasAssignedOrders, setHasAssignedOrders] = useState(false);

  // 🚀 최초 로딩 시 배정된 주문 여부 확인
  useEffect(() => {
    const fetchAssignedOrders = async () => {
      try {
        const res = await axios.get('/order/rider/assigned');
        if (res.data.orders && res.data.orders.length > 0) {
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
  ];

  return (
    <div>
      <Tabs tabs={tabs} activeKey={activeKey} onChange={(key) => setActiveKey(key as 'available' | 'assigned')} />
      <div>
        {activeKey === 'available' && <AvailableOrdersPage />}
        {activeKey === 'assigned' && <RiderOrdersPage />}
      </div>
    </div>
  );
};

export default RiderHome;
