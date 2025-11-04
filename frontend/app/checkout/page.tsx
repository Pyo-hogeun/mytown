'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import PortOne from "@portone/browser-sdk/v2"
import type { RootState } from '@/redux/store';
import axios from '@/utils/axiosInstance';
import { createOrder } from '@/redux/slices/orderSlice';
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
  > div{
    display:flex;
    justify-content:space-between;
  }
  align-items:center;
  padding:10px 0;
  border-bottom:1px solid #f2f2f2;
  &:last-child{border-bottom:none;}
`;
const Price = styled.div`font-weight:600;`;


const PayButton = styled.button<{ disabled?: boolean }>`
  width:100%;padding:14px;border:none;border-radius:10px;
  background:${p => p.disabled ? '#c9c9c9' : '#0070f3'};color:#fff;cursor:${p => p.disabled ? 'not-allowed' : 'pointer'};
  display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;
`;

type CheckoutItem = {
  _id: string;
  product: string;
  name: string;
  store: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  optionName?: string;
  optionExtraPrice: number;
};
type PaymentStatusType = 'IDLE' | 'PENDING' | 'FAILED' | 'PAID';
interface PaymentStatus {
  status: PaymentStatusType;
  message?: string;
}
const CheckoutPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<any>();
  const orderState = useSelector((s: RootState) => s.order);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'IDLE',
  })
  // Redux에서 배송 정보 가져오기
  const { receiver, phone, address, detailAddress, deliveryTime } = orderState;

  const NEXT_PUBLIC_PORTONE_STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID!;
  const NEXT_PUBLIC_PORTONE_CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // 선택 항목 파싱
  const items: CheckoutItem[] = useMemo(() => {
    const param = searchParams.get('items');
    if (!param) return [];
    try { return JSON.parse(decodeURIComponent(param)); } catch { return []; }
  }, [searchParams]);

  const totalPrice = useMemo(
    () =>
      items.reduce((sum, i) => {
        const base = i.unitPrice ?? 0;
        const add = i.optionExtraPrice ?? 0;
        return sum + (base + add) * i.quantity;
      }, 0),
    [items]
  );

  const randomId = () => {
    return [...crypto.getRandomValues(new Uint32Array(2))]
      .map((word) => word.toString(16).padStart(8, "0"))
      .join("")
  }
  const handleClose = () =>
    setPaymentStatus({
      status: "IDLE",
    })
  const isWaitingPayment = paymentStatus.status !== "IDLE"

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setPaymentStatus({ status: "PENDING" })
    const paymentId = randomId();
    const payment = await PortOne.requestPayment({
      storeId: NEXT_PUBLIC_PORTONE_STORE_ID,
      channelKey: NEXT_PUBLIC_PORTONE_CHANNEL_KEY,
      paymentId,
      orderName: items[0].name,
      totalAmount: totalPrice,
      currency: "KRW",
      payMethod: "CARD",
      redirectUrl: `${API_BASE_URL}/payment-redirect`,
    })
    if (payment?.code !== undefined) {
      setPaymentStatus({
        status: "FAILED",
        message: payment.message,
      })
      return
    }

    try {
      // 백엔드에 검증 요청
      const { data } = await axios.post("/payment/complete", {
        paymentId: payment?.paymentId,
        amount: totalPrice,
      });
      console.log('data: ', data);

      if (data.status === "PAID") {
        setPaymentStatus({ status: "PAID" });
        alert("결제 성공! 주문을 생성합니다.");

        // 주문 생성
      const payloadItems = items.map(i => ({
        _id: i._id,
        product: i.product,
        name: i.name,
        store: i.store,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        optionName: i.optionName,
        optionExtraPrice: i.optionExtraPrice,
      }));

      const action = await dispatch(
        createOrder({
          items: payloadItems,
          paymentMethod: "CARD",
          receiver,
          phone,
          address,
          detailAddress,
          deliveryTime,
          totalPrice,
        })
      );

      if (createOrder.fulfilled.match(action)) {
        dispatch(fetchCart());
        setPaymentStatus({ status: "PAID" });
        router.push(`/order-complete`);
      } else {
        setPaymentStatus({
          status: "FAILED",
          message: "주문 생성에 실패했습니다.",
        });
      }
      } else {
        setPaymentStatus({
          status: "FAILED",
          message: "결제 상태가 PAID가 아닙니다.",
        });
      }
    } catch (err: any) {
      console.error(err);
      setPaymentStatus({
        status: "FAILED",
        message: err.response?.data?.message || "결제 검증 실패",
      });
    }
  }

  return (
    <Container>

      <Card>
        <SectionTitle>주문 요약</SectionTitle>
        {items.map(i => (
          <Row key={i._id}>
            <div>
              {i.name}
              <Price>{(i.unitPrice).toLocaleString()}원</Price>
            </div>
            <div>
              {i.optionName}
              <Price>{(i.optionExtraPrice).toLocaleString()}원 </Price>
            </div>
            <div>
              <span>총수량</span>
              X {i.quantity}
            </div>

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

        <PayButton type="submit">결제</PayButton>
      </Card>

      <Card>

        <form onSubmit={handleSubmit}>
          <article>
            {
              items.map((item, index) => {
                return (
                  <div className="item" key={index}>
                    <div className="item-image">
                      {/* <img src={`/${item.id}.png`} /> */}
                    </div>
                    <div className="item-text">
                      <h5>{item.name}</h5>
                      <p>{item.unitPrice.toLocaleString()}원</p>
                    </div>
                  </div>
                )

              })
            }
            <div className="price">
              <label>총 구입 가격</label>
              {totalPrice.toLocaleString()}원
            </div>
          </article>
          <button
            type="submit"
            aria-busy={isWaitingPayment}
            disabled={isWaitingPayment}
          >
            결제
          </button>
        </form>
        {paymentStatus.status === "FAILED" && (
          <dialog open>
            <header>
              <h1>결제 실패</h1>
            </header>
            <p>{paymentStatus.message}</p>
            <button type="button" onClick={handleClose}>
              닫기
            </button>
          </dialog>
        )}
        <dialog open={paymentStatus.status === "PAID"}>
          <header>
            <h1>결제 성공</h1>
          </header>
          <p>결제에 성공했습니다.</p>
          <button type="button" onClick={handleClose}>
            닫기
          </button>
        </dialog>
      </Card>

    </Container>
  );
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>로딩중..</div>}>
      <CheckoutPageContent />
    </Suspense>
  )
};