'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, PaymentMethod } from '@/redux/slices/orderSlice';
import type { RootState } from '@/redux/store';
import { fetchCart } from '@/redux/slices/cartSlice';

const Container = styled.div`
  max-width:900px;
  margin:60px auto;
  padding:20px;
  display:grid;
  grid-template-columns:2fr 1fr;
  gap:24px;
`;
const Card = styled.div`
  background:#fff;
  border:1px solid #eee;
  border-radius:12px;
  padding:20px;
  box-shadow:0 6px 16px rgba(0,0,0,0.04);
`;
const SectionTitle = styled.h2`font-size:18px;margin-bottom:12px;`;
const Row = styled.div`
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:10px 0;
  border-bottom:1px solid #f2f2f2;
  &:last-child{border-bottom:none;}
`;
const Price = styled.div`font-weight:600;`;
const RadioRow = styled.div`display:flex;gap:12px;`;
const Input = styled.input`
  width:100%;
  padding:10px;
  border:1px solid #ddd;
  border-radius:8px;
  box-sizing:border-box;
`;
const Inline = styled.div`display:flex;margin-bottom:10px;gap:8px;`;
const Select = styled.select`
  padding:10px;
  border:1px solid #ddd;
  border-radius:8px;
`;
const Agree = styled.label`
  display:flex;
  align-items:center;
  gap:8px;
  margin-top:12px;
`;
const paySpin = keyframes`0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}`;
const Spinner = styled.div`
  width:16px;
  height:16px;
  border-radius:50%;
  border:2px solid #fff;
  border-top-color:transparent;
  animation:${paySpin} 0.6s linear infinite;
`;
const PayButton = styled.button<{ disabled?: boolean }>`
  width:100%;padding:14px;border:none;border-radius:10px;
  background:${p => p.disabled ? '#c9c9c9' : '#0070f3'};color:#fff;cursor:${p => p.disabled ? 'not-allowed' : 'pointer'};
  display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;
`;

type CartItem = {
  _id: string;
  product: { _id: string; name: string; price: number; store: string | null };
  quantity: number;
};

const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<any>();
  const orderState = useSelector((s: RootState) => s.order);

  // 선택 항목 파싱
  const items: CartItem[] = useMemo(() => {
    const param = searchParams.get('items');
    if (!param) return [];
    try { return JSON.parse(decodeURIComponent(param)); } catch { return []; }
  }, [searchParams]);

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.product.price, 0),
    [items]
  );

  // 결제 수단 상태
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [installment, setInstallment] = useState('0');
  const [cardBrand, setCardBrand] = useState('국민');
  const [agree, setAgree] = useState(false);

  // Redux에서 배송 정보 가져오기
  const { receiver, phone, address, deliveryTime } = orderState;

  const onCardNumberChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    const grouped = digits.replace(/(\d{4})(?=\d)/g, '$1-');
    setCardNumber(grouped);
  };
  const onExpiryChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    let out = digits;
    if (digits.length >= 3) out = digits.slice(0, 2) + '/' + digits.slice(2);
    setExpiry(out);
  };

  const isCardFormValid = () => {
    if (method !== 'card') return true;
    const okNumber = /^\d{4}-\d{4}-\d{4}-\d{4}$/.test(cardNumber);
    const okExpiry = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry);
    const okCvc = /^\d{3,4}$/.test(cvc);
    return okNumber && okExpiry && okCvc;
  };

  const canPay =
    items.length > 0 &&
    agree &&
    receiver.trim() !== '' &&
    phone.trim() !== '' &&
    address.trim() !== '' &&
    deliveryTime &&
    isCardFormValid() &&
    orderState.status !== 'processing';

  const maskedCard =
    method === 'card'
      ? cardNumber.replace(/^(\d{0,4})-(\d{0,4})-(\d{0,4})-(\d{0,4})$/, '****-****-****-$4')
      : undefined;

  const onPay = async () => {
    if (!canPay) return;
    try {
      const action = await dispatch(
        createOrder({
          items,
          paymentMethod: method,
          receiver,
          phone,
          address,
          deliveryTime,
          maskedCard,
        })
      );

      if (createOrder.fulfilled.match(action)) {
        dispatch(fetchCart());
        router.push(`/order-complete`);
      }
    } catch {}
  };

  return (
    <Container>
      <Card>
        <SectionTitle>결제 수단</SectionTitle>
        <RadioRow>
          <label><input type="radio" name="pm" checked={method === 'card'} onChange={() => setMethod('card')} /> 신용/체크카드</label>
          <label><input type="radio" name="pm" checked={method === 'kakao'} onChange={() => setMethod('kakao')} /> 카카오페이</label>
          <label><input type="radio" name="pm" checked={method === 'naver'} onChange={() => setMethod('naver')} /> 네이버페이</label>
        </RadioRow>

        {method === 'card' && (
          <>
            <SectionTitle style={{ marginTop: 16 }}>카드 정보</SectionTitle>
            <Inline>
              <Select value={cardBrand} onChange={(e) => setCardBrand(e.target.value)}>
                <option>국민</option><option>신한</option><option>현대</option><option>삼성</option><option>우리</option>
              </Select>
              <Select value={installment} onChange={(e) => setInstallment(e.target.value)}>
                <option value="0">일시불</option>
                <option value="2">2개월</option>
                <option value="3">3개월</option>
                <option value="6">6개월</option>
              </Select>
            </Inline>

            <div style={{ marginTop: 10 }} />
            <label>카드번호</label>
            <Input
              inputMode="numeric"
              placeholder="0000-0000-0000-0000"
              value={cardNumber}
              onChange={(e) => onCardNumberChange(e.target.value)}
            />
            <Inline>
              <div style={{ flex: 1 }}>
                <label>만료 (MM/YY)</label>
                <Input inputMode="numeric" placeholder="MM/YY" value={expiry} onChange={(e) => onExpiryChange(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label>CVC</label>
                <Input inputMode="numeric" placeholder="***" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))} />
              </div>
            </Inline>
          </>
        )}

        <Agree>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          결제 이용약관과 개인정보 제3자 제공에 동의합니다.
        </Agree>

        <PayButton disabled={!canPay} onClick={onPay}>
          {orderState.status === 'processing' && <Spinner />}
          {orderState.status === 'processing' ? '결제 처리 중...' : '결제하기'}
        </PayButton>

        {orderState.status === 'failed' && (
          <div style={{ color: 'crimson', marginTop: 8 }}>결제/주문에 실패했습니다: {orderState.error ?? '오류'}</div>
        )}
      </Card>

      <Card>
        <SectionTitle>주문 요약</SectionTitle>
        {items.map(i => (
          <Row key={i._id}>
            <div>{i.product.name} x {i.quantity}</div>
            <Price>{(i.product.price * i.quantity).toLocaleString()}원</Price>
          </Row>
        ))}
        <Row>
          <div>상품 합계</div>
          <Price>{totalPrice.toLocaleString()}원</Price>
        </Row>
        <Row>
          <div>배송비</div>
          <Price>0원</Price>
        </Row>
        <Row>
          <div style={{ fontWeight: 700 }}>총 결제금액</div>
          <Price style={{ fontSize: 18 }}>{totalPrice.toLocaleString()}원</Price>
        </Row>
        {method === 'card' && maskedCard && (
          <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
            선택 카드: {maskedCard} ({cardBrand}, {installment === '0' ? '일시불' : `${installment}개월`})
          </div>
        )}
      </Card>
    </Container>
  );
};

export default CheckoutPage;
