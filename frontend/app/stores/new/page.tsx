'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Container from '@/app/component/Container';
import StoreForm from './StoreForm';

const Page = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => setIsHydrated(true), []);

  const user = useSelector((state: RootState) => state.auth.user);
  // ✅ 권한이 있는 역할들을 배열로 정의
  const allowedRoles = ['admin'];

  if (!isHydrated) return null;

  return (
    <Container>
      {
        !user || !allowedRoles.includes(user.role || '') ? (
          <p>권한이 없습니다.</p>
        ) : (
          <StoreForm />
        )
      }
    </Container>
  );
};

export default Page;
