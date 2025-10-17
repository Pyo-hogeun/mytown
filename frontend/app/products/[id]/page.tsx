//products/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from '@/utils/axiosInstance';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { addToCart } from '@/redux/slices/cartSlice';
import Select from '@/app/component/Select';

import { clearProduct, fetchProductById } from '@/redux/slices/productSlice';
import QuantitySelector from '@/app/component/QuantitySelector';


// --------------------------- 스타일 (styled-components) ---------------------------
const Container = styled.div`
  max-width: 920px;
  margin: 32px auto;
  padding: 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Gallery = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;

const MainImage = styled.img`
  width: 100%;
  height: 420px;
  object-fit: cover;
  border-radius: 8px;
`;

const Thumbs = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
`;
const Thumb = styled.img<{ active: boolean }>`
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  opacity: ${props => (props.active ? 1 : 0.7)};
  box-shadow: ${props => (props.active ? '0 4px 12px rgba(0,0,0,0.15)' : 'none')};
`;

const InfoCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;

const Title = styled.h1`
  font-size: 20px;
  margin: 0 0 8px 0;
`;

const Price = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #e74c3c;
  margin-bottom: 8px;
`;

const Small = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const OptionBox = styled.div`
  margin: 12px 0;
`;

const QtyWrap = styled.div`
  display:flex;
  align-items:center;
  gap:8px;
  margin: 12px 0;
`;

const QtyButton = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const AddButton = styled.button`
  display:block;
  width:100%;
  padding: 12px 16px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 12px;
`;

const Description = styled.div`
  margin-top: 18px;
  line-height: 1.6;
`;

const Reviews = styled.div`
  margin-top: 18px;
`;

const ReviewItem = styled.div`
  padding: 12px;
  border-bottom: 1px solid #eee;
`;

// --------------------------- 타입 정의 ---------------------------
type Option = {
  _id?: string;
  name: string;
  extraPrice?: number;
  stock?: number;
};

type Review = {
  _id?: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt?: string;
};

type Product = {
  _id: string;
  name: string;
  price: number;
  storeName: string;
  storeId: string;
  stockQty: number;
  imageUrl?: string; // 기존 데이터 호환성
  images?: string[]; // 권장 필드
  options?: Option[];
  description?: string;
  reviews?: Review[];
};

// --------------------------- 컴포넌트 ---------------------------
const ProductDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params && (params as any).id) || null; // next/navigation useParams 타입이 널 수 있음

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  // const [product, setProduct] = useState<Product | null>(null);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  const [mainIndex, setMainIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // 후기 쓰기 상태
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');

  const { selected: product, loading, error } = useSelector((state: RootState) => state.product);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchProductById(id));

    return () => { dispatch(clearProduct()); };

  }, [id, dispatch]);

  if (!id) return <Container>상품 ID가 없습니다.</Container>;
  if (loading) return <Container>로딩중...</Container>;
  if (error) return <Container>{error}</Container>;
  if (!product) return <Container>상품을 찾을 수 없습니다.</Container>;

  // 이미지 배열 구성 (기존 imageUrl 호환 처리)
  const images = (product.images && product.images.length > 0) ? product.images : (product.imageUrl ? [product.imageUrl] : ['/no-image.png']);

  // 선택된 옵션 객체
  const selectedOption = product.options?.find(o => o._id === selectedOptionId) || null;

  // 가격 계산 (옵션의 추가가격이 있다면 합산)
  const optionExtra = selectedOption?.extraPrice || 0;
  const finalPrice = product.price + optionExtra;

  // 남은 수량: 옵션별 재고 우선, 없으면 product.stockQty 사용
  const remaining = selectedOption?.stock ?? product.stockQty;

  const increment = () => setQuantity(prev => Math.min(prev + 1, Math.max(1, remaining)));
  const decrement = () => setQuantity(prev => Math.max(1, prev - 1));

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      router.push('/login')
    }
    if (user?.role !== 'user') {
      alert('로그인 후 장바구니를 사용할 수 있습니다.');
      return;
    }
    if (quantity > remaining) {
      alert('주문 수량이 남은 수량을 초과합니다.');
      return;
    }
    // ADD TO CART 액션: productId, optionId (있으면), quantity 포함
    dispatch(addToCart({
      productId: product._id,
      optionId: selectedOption?._id,
      storeId: product.storeId,
      quantity,
      price: finalPrice,
      name: product.name,
      imageUrl: images[0],
      storeName: product.storeName
    }));
    alert('장바구니에 추가되었습니다.');
  };


  return (
    <Container>
      <Grid>
        <Gallery>
          <MainImage src={images[mainIndex]} alt={product.name} />
          <Thumbs>
            {images.map((src, idx) => (
              <Thumb key={idx} src={src} alt={`thumb-${idx}`} active={idx === mainIndex} onClick={() => setMainIndex(idx)} />
            ))}
          </Thumbs>
        </Gallery>

        <InfoCard>
          <Title>{product.name}</Title>
          <Price>{finalPrice.toLocaleString()}원</Price>
          <Small>가게: {product.storeName}</Small>
          <Small>남은 수량: {remaining}개</Small>

          {product.options && product.options.length > 0 && (
            <OptionBox>
              <div>옵션</div>
              <Select value={selectedOptionId || ''} onChange={(e) => setSelectedOptionId(e.target.value || null)}>
                <option>옵션을 선택해주세요</option>
                {product.options.map((opt) => (
                  <option key={opt._id || opt.name} value={opt._id}>{opt.name}{opt.extraPrice ? ` (+${opt.extraPrice.toLocaleString()}원)` : ''}{opt.stock !== undefined ? ` - 재고 ${opt.stock}` : ''}</option>
                ))}
              </Select>
            </OptionBox>
          )}

          {/* <QtyWrap>
            <div>수량</div>
            <QtyButton onClick={decrement}>-</QtyButton>
            <div>{quantity}</div>
            <QtyButton onClick={increment}>+</QtyButton>
            <div style={{ marginLeft: 'auto', fontSize: 14, color: '#888' }}>재고: {remaining}</div>
          </QtyWrap> */}

          <QuantitySelector
            quantity={quantity}
            remaining={selectedOption?.stock ?? product.stockQty}
            onChange={(val) => setQuantity(val)}
          />

          <AddButton onClick={handleAddToCart}>장바구니 담기</AddButton>

          <Description>
            <h3>상품 설명</h3>
            <div dangerouslySetInnerHTML={{ __html: product.description || '<i>상세 설명이 없습니다.</i>' }} />
          </Description>

        </InfoCard>
      </Grid>

      <Reviews>
        <h3>구매 후기</h3>
        {(product.reviews && product.reviews.length > 0) ? (
          product.reviews.map(rv => (
            <ReviewItem key={rv._id || Math.random()}>
              <div style={{ fontWeight: 700 }}>{rv.userName || '익명'}</div>
              <div>별점: {rv.rating} / 5</div>
              <div style={{ marginTop: 8 }}>{rv.comment}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>{new Date(rv.createdAt || Date.now()).toLocaleString()}</div>
            </ReviewItem>
          ))
        ) : (
          <div>후기가 없습니다.</div>
        )}

      </Reviews>
    </Container>
  );
}
export default ProductDetailPage