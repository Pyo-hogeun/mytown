'use client';

import styled from 'styled-components';
import { useEffect } from 'react';
import axios from '@/utils/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setProducts } from '@/store/productSlice';

const Container = styled.div`
  padding: 2rem;
`;

const Card = styled.div`
  background: white;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
`;

export default function ProductListPage() {
  const dispatch = useDispatch();
  const products = useSelector((state: RootState) => state.product.items);

  useEffect(() => {
    axios.get('/products')
      .then((res) => dispatch(setProducts(res.data)))
      .catch((err) => console.error(err));
  }, [dispatch]);

  return (
    <Container>
      <h1>📦 상품 목록</h1>
      {products.map((product) => (
        <Card key={product._id}>
          <h2>{product.name}</h2>
          <p>가격: {product.price}원</p>
          <p>마트: {product.storeName}</p>
        </Card>
      ))}
    </Container>
  );
}
