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
  .column-1-3{
    grid-column: 1 / 3;
  }
  ${(props) => props.theme.breakpoints.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Gallery = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  ${(props) => props.theme.breakpoints.mobile} {
    grid-column: 1 / 3;
  }
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
  ${(props) => props.theme.breakpoints.mobile} {
    grid-column: 1 / 3;
  }
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

const ProductDetailPageClient = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const dispatch = useDispatch<AppDispatch>();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const product = useSelector((state: RootState) => state.products.product);
  const user = useSelector((state: RootState) => state.auth.user);

  // product id fetch
  useEffect(() => {
    if (!productId) return;
    dispatch(fetchProductById(productId));
    return () => {
      dispatch(clearProduct());
    };
  }, [dispatch, productId]);

  // 이미지 초기화
  useEffect(() => {
    if (product?.imageUrl) {
      setSelectedImage(product.imageUrl);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({ product, quantity }));
    router.push('/cart');
  };

  if (!product) return <Container>로딩중...</Container>;

  return (
    <Container>
      <Grid>
        <Gallery>
          <MainImage src={selectedImage || product.imageUrl} alt={product.name} />
          {product.images && product.images.length > 0 && (
            <Thumbs>
              {product.images.map((img: string) => (
                <Thumb
                  key={img}
                  src={img}
                  alt={product.name}
                  $active={selectedImage === img}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </Thumbs>
          )}
        </Gallery>

        <InfoCard>
          <Title>{product.name}</Title>
          <Price>{product.price.toLocaleString()}원</Price>
          <Small>매장: {product.storeName}</Small>
          <Small>재고: {product.stockQty}</Small>

          <OptionBox>
            <Select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}개</option>
              ))}
            </Select>
          </OptionBox>

          <AddButton onClick={handleAddToCart}>장바구니 담기</AddButton>
        </InfoCard>

        <Description className="column-1-3">
          {product.description || '상품 상세 설명이 없습니다.'}
        </Description>

        {user && (
          <ReviewList productId={productId} />
        )}
      </Grid>
    </Container>
  );
}

export default ProductDetailPageClient;
