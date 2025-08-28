'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import axios from '@/utils/axiosInstance';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setStores } from '@/redux/slices/storeSlice';

const Container = styled.div`
  padding: 2rem;
  max-width: 400px;
  margin: auto;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-top: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  margin-top: 1rem;
  padding: 0.6rem 1rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 6px;
`;

export default function ProductForm() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [stockQty, setStockQty] = useState<number>(0);
  const [storeId, setStoreId] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();
  const stores = useSelector((state: RootState) => state.store.items);

  // 마트 목록 불러오기
  useEffect(() => {
    axios.get('/stores')
      .then(res => dispatch(setStores(res.data)))
      .catch(err => console.error(err));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/products', { storeId, name, price, stockQty, imageUrl });
      router.push('/products');
    } catch (err) {
      console.error('등록 실패', err);
    }
  };

  return (
    <Container>
      <h1>📝 상품 등록</h1>
      <form onSubmit={handleSubmit}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="상품 이름" required />
        <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="가격" required />
        <Input type="number" value={stockQty} onChange={(e) => setStockQty(Number(e.target.value))} placeholder="수량" />

        <Select value={storeId} onChange={(e) => setStoreId(e.target.value)} required>
          <option value="">마트 선택</option>
          {stores.map((store) => (
            <option key={store._id} value={store._id}>{store.name}</option>
          ))}
        </Select>

        <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="상품이미지" />
        <Button type="submit">등록하기</Button>
      </form>
    </Container>
  );
}
