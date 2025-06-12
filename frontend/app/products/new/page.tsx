'use client';

import styled from 'styled-components';
import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

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

const Button = styled.button`
  margin-top: 1rem;
  padding: 0.6rem 1rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 6px;
`;

export default function ProductForm() {
  const [storeName, setStoreName] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [stockQty, setStockQty] = useState<number>(0);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', { storeName, name, price, stockQty, imageUrl });
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
        <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="마트 이름" required />
        <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="상품이미지" />
        <Button type="submit">등록하기</Button>
      </form>
    </Container>
  );
}
