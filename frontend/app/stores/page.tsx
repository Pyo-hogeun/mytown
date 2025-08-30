'use client';

import React from 'react';
import StoreList from '@/app/component/StoreList';

const StorePage = () => {
  return (
    <main style={{ padding: '20px' }}>
      <h1>매장 관리</h1>
      <StoreList />
    </main>
  );
};

export default StorePage;
