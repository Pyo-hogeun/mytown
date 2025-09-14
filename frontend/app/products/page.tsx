'use client';

import styled from 'styled-components';
import { useEffect } from 'react';
import axios from '@/utils/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { setProducts } from '@/redux/slices/productSlice';
import { useRequireLogin } from '../hooks/useRequireLogin';
import { addToCart } from '@/redux/slices/cartSlice';
import Container from '../component/Container';
import Link from 'next/link';

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
  color: #2c3e50;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
`;

const CardItem = styled.div`
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const ImageBox = styled.div`
  width: 100%;
  height: 160px;
  background: #f7f7f7;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    max-width: 100%;
    max-height: 100%;
    flex-basis: 100%;
    object-fit: cover;
  }
`;

const Info = styled.div`
  padding: 1rem;
  flex: 1;
`;

const Name = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const Price = styled.p`
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
  margin: 0.5rem 0;
`;
const StockQty = styled.p`
  font-size: 18px;
  margin: 0.5rem 0;
`
const Store = styled.p`
  font-size: 14px;
  color: #888;
`;

const Button = styled.button`
  margin: 1rem;
  padding: 0.6rem;
  background: #27ae60;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #219150;
  }
`;

const ProductListPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { requireLogin } = useRequireLogin();
  const products = useSelector((state: RootState) => state.product.items);
  const user = useSelector((state: RootState) => state.auth.user);
  const handleAddToCart = (productId: string) => {
    requireLogin(() => {
      if (user?.role === "user") {
        dispatch(addToCart({ productId }));
      } else {
        alert("관리자는 장바구니를 사용할 수 없습니다.");
      }
    });
  };

    // ✅ 권한이 있는 역할들을 배열로 정의
    const allowedRoles = ['master', 'admin', 'manager'];

  useEffect(() => {
    let url = '/products';
    if (user?.role === 'manager') {
      // 매니저라면 첫 번째 store 기준으로 상품 목록 조회
      url = `/products/store/${user?.store?._id}`;
    }

    axios.get(url)
      .then((res) => dispatch(setProducts(res.data)))
      .catch((err) => console.error(err));
  }, [dispatch]);

  return (
    <Container>
      <Title>🛒 오늘의 상품</Title>
      <Grid>
        {products.length > 0 ?
          products.map((product) => (
            <CardItem key={product._id}>
              <Link href={`/products/${product._id}`}>
                <ImageBox>
                  {/* 상품 이미지 API에 따라 다르게 처리 */}
                  <img src={product.imageUrl || '/no-image.png'} alt={product.name} />
                </ImageBox>
                <Info>
                  <Name>{product.name}</Name>
                  <Price>{product.price.toLocaleString()}원</Price>
                  {user?.role && user.role !== "user" && (
                    <StockQty>수량 : {product.stockQty}개</StockQty>
                  )}

                  <Store>{product.storeName}</Store>
                </Info>
                {user?.role && allowedRoles.includes(user.role) ?
                  <Link href={`/products/${product._id}/edit`}>
                    <Button>편집</Button>
                  </Link>: false
                }
                {user?.role === 'user' ? <Button onClick={() => handleAddToCart(product._id)}>장바구니 담기</Button> : undefined}
              </Link>

            </CardItem>



          )) : '상품이 없습니다'}
      </Grid>
    </Container>
  );
};

export default ProductListPage;
