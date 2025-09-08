'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import axios from '@/utils/axiosInstance';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setStores } from '@/redux/slices/storeSlice';
import Input from '@/app/component/Input';
import Select from '@/app/component/Select';

const Container = styled.div`
  padding: 2rem;
  max-width: 400px;
  margin: auto;
`;
const Label = styled.div`
  margin-bottom: 0.2rem;
`
const Button = styled.button`
  margin-top: 1rem;
  padding: 0.6rem 1rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 6px;
`;
const List = styled.ul`
  li{
    list-style: none;
    margin-bottom: 10px;
  }
`
const ProductForm = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [stockQty, setStockQty] = useState<number>(0);
  const [storeId, setStoreId] = useState('');
  const [storeName, setStoreName] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();
  const stores = useSelector((state: RootState) => state.store.items);
  const user = useSelector((state: RootState) => state.auth.user);

  // ✅ 권한이 있는 역할들을 배열로 정의
  const allowedRoles = ['admin', 'manager'];


  // 마트 목록 불러오기
  useEffect(() => {
    axios.get('/stores')
      .then(res => dispatch(setStores(res.data)))
      .catch(err => console.error(err));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/products', {
        storeId,
        storeName,  // ✅ storeName도 전달
        name,
        price,
        stockQty,
        imageUrl
      });
      router.push('/products');
    } catch (err) {
      console.error('등록 실패', err);
    }
  };

  if (!user || !allowedRoles.includes(user.role)) {
    return (<p>권한이 없습니다.</p>)
  } else {

    return (
      <Container>
        <h1>📝 상품 등록 {user.role}</h1>
        <form onSubmit={handleSubmit}>
          <List>
            <li>
              <Label>상품이름</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="상품 이름" required />
            </li>
            <li>
              <Label>가격</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="가격" required />
            </li>
            <li>
              <Label>수량</Label>
              <Input type="number" value={stockQty} onChange={(e) => setStockQty(Number(e.target.value))} placeholder="수량" />
            </li>
            <li>
              <Label>마트</Label>
              <Select
                value={storeId}
                onChange={(e) => {
                  const selectedOption = e.target.selectedOptions[0];
                  setStoreId(e.target.value);
                  setStoreName(selectedOption.label); // ✅ storeName 저장
                }}
                required
              >
                <option value="">마트 선택</option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id} label={store.name}>
                    {store.name}
                  </option>
                ))}
              </Select>

            </li>
            <li>
              <Label>상품이미지</Label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="상품이미지" />
              <p>'https://...' 처럼 절대경로를 포함해야합니다.</p>
            </li>
          </List>

          <Button type="submit">등록하기</Button>
        </form>
      </Container >
    );
  }
}
export default ProductForm