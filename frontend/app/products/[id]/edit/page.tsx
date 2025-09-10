'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import axios from '@/utils/axiosInstance';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setStores } from '@/redux/slices/storeSlice';
import Input from '@/app/component/Input';
import Select from '@/app/component/Select';
import Container from '@/app/component/Container';

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

const ProductEditPage = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [stockQty, setStockQty] = useState<number>(0);
  const [storeId, setStoreId] = useState('');
  const [storeName, setStoreName] = useState('');

  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const dispatch = useDispatch();
  const stores = useSelector((state: RootState) => state.store.items);
  const user = useSelector((state: RootState) => state.auth.user);

  const allowedRoles = ['admin', 'manager'];

  // 마트 목록 불러오기
  useEffect(() => {
    axios.get('/stores')
      .then(res => dispatch(setStores(res.data)))
      .catch(err => console.error(err));
  }, [dispatch]);

  // 기존 상품 데이터 불러오기
  useEffect(() => {
    if (productId) {
      axios.get(`/products/${productId}`)
        .then(res => {
          const p = res.data;
          setName(p.name);
          setPrice(p.price);
          setStockQty(p.stockQty);
          setImageUrl(p.imageUrl);
          setStoreId(p.store);
          setStoreName(p.storeName);
        })
        .catch(err => console.error('상품 불러오기 실패', err));
    }
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`/products/${productId}`, {
        storeId,
        storeName,
        name,
        price,
        stockQty,
        imageUrl
      });
      router.push('/products');
    } catch (err) {
      console.error('수정 실패', err);
    }
  };

  return (
    <Container>
      {!user || !user.role || !allowedRoles.includes(user.role) ?
        (<p>권한이 없습니다.</p>) :
        (<>
          <h1>✏️ 상품 편집</h1>
          <form onSubmit={handleSubmit}>
            <List>
              <li>
                <Label>상품이름</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </li>
              <li>
                <Label>가격</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
              </li>
              <li>
                <Label>수량</Label>
                <Input type="number" value={stockQty} onChange={(e) => setStockQty(Number(e.target.value))} />
              </li>
              <li>
                <Label>마트</Label>
                <Select
                  value={storeId}
                  onChange={(e) => {
                    const selectedOption = e.target.selectedOptions[0];
                    setStoreId(e.target.value);
                    setStoreName(selectedOption.label);
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
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </li>
            </List>

            <Button type="submit">수정하기</Button>
          </form>
        </>)
      }
    </Container >
  );
}

export default ProductEditPage;
