'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

const Wrap = styled.div`max-width:640px;margin:80px auto;padding:24px;text-align:center;background:#fff;border:1px solid #eee;border-radius:12px;box-shadow:0 6px 16px rgba(0,0,0,0.04);`;
const H1 = styled.h1`font-size:22px;margin-bottom:6px;`;
const Sub = styled.p`color:#666;margin:0 0 18px;`;
const BtnRow = styled.div`display:flex;justify-content:center;gap:12px;margin-top:12px;`;
const Btn = styled.button`padding:10px 16px;border-radius:10px;border:1px solid #ddd;background:#fff;cursor:pointer; &:hover{background:#f7f7f7}`;

export default function OrderComplete() {
  const sp = useSearchParams();
  const router = useRouter();
  const orderId = sp.get('orderId');
  const { lastPaymentMethod, maskedCard } = useSelector((state: RootState) => state.order);

  return (
    <Wrap>
      <H1>주문이 완료되었습니다 🎉</H1>
      <Sub>주문번호: <b>{orderId}</b></Sub>
      {lastPaymentMethod && (
        <Sub>결제수단: {lastPaymentMethod.toUpperCase()} {maskedCard ? `(${maskedCard})` : ''}</Sub>
      )}
      <BtnRow>
        <Btn onClick={()=>router.push('/products')}>쇼핑 계속하기</Btn>
        <Btn onClick={()=>router.push('/cart')}>장바구니로</Btn>
      </BtnRow>
    </Wrap>
  );
}
