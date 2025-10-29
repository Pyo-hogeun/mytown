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
import ReviewList from '@/app/component/ReviewList';


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
  .column-1-3{
    grid-column: 1 / 3;
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
const Thumb = styled.img<{ $active?: boolean }>`
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  opacity: ${props => (props.$active ? 1 : 0.7)};
  box-shadow: ${props => (props.$active ? '0 4px 12px rgba(0,0,0,0.15)' : 'none')};
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

  const handleAddToCart = async () => {
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
    try {
      // ADD TO CART 액션: productId, optionId (있으면), quantity 포함
      await dispatch(addToCart({
        productId: product._id,
        optionId: selectedOption?._id,
        storeId: product.storeId,
        quantity,
        price: finalPrice,
        name: product.name,
        imageUrl: images[0],
        storeName: product.storeName
      })).unwrap();
      alert('장바구니에 추가되었습니다.');
    } catch (err) {
      if (err === "DIFFERENT_STORE") {
        if (window.confirm("다른 매장의 상품이 담겨 있습니다. 기존 장바구니를 비우고 새로 담을까요?")) {
          await axios.post("/cart/clear");
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
        }
      } else {
        alert(err);
      }
    }
  };


  return (
    <Container>
      <Grid>
        <Gallery>
          <MainImage src={images[mainIndex]} alt={product.name} />
          <Thumbs>
            {images.map((src, idx) => (
              <Thumb key={idx} src={src} alt={`thumb-${idx}`} $active={idx === mainIndex} onClick={() => setMainIndex(idx)} />
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
        <ReviewList productId={product._id} />
      </Grid>

      
    </Container>
  );
}
export default ProductDetailPage