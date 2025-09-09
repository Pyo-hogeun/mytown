'use client';

import React from 'react';
import StoreList from '@/app/component/StoreList';
import Container from '../component/Container';

const StorePage = () => {
  return (
    <Container>
      <h1>매장 관리</h1>
      <StoreList />
    </Container>
  );
};

export default StorePage;
