'use client';

import styled from 'styled-components';
import { useEffect } from 'react';
import axios from '@/utils/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setProducts } from '@/redux/slices/productSlice';

const Container = styled.div`
  padding: 2rem;
`;

const CardItem = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #333;
  h2{
    font-size: 16px;
    color: #333;
  }
  p{
    margin: 4px;
  }
`;

const  ProductListPage = () => {
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
        <CardItem key={product._id}>
          <h2>{product.name}</h2>
          <p>가격: {product.price}원</p>
          <p>마트: {product.storeName}</p>
        </CardItem>
      ))}
    </Container>
  );
}

export default ProductListPage