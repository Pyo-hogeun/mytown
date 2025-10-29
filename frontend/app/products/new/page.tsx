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
`;
const OptionContainer = styled.div`
  border: 1px solid #ccc;
  padding: 10px;
  margin-top: 10px;
`;
const ProductForm = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [stockQty, setStockQty] = useState<number>(0);
  const [storeId, setStoreId] = useState('');
  const [storeName, setStoreName] = useState('');
  const [options, setOptions] = useState<{ name: string; extraPrice: number }[]>([]);
  const router = useRouter();
  const dispatch = useDispatch();
  const stores = useSelector((state: RootState) => state.store.items);
  const user = useSelector((state: RootState) => state.auth.user);

  // ✅ 권한이 있는 역할들을 배열로 정의
  const allowedRoles = ['master', 'admin', 'manager'];


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
        imageUrl,
        options, // ✅ 옵션도 함께 전송
      });
      router.push('/products');
    } catch (err) {
      console.error('등록 실패', err);
    }
  };
  const addOption = () => {
    setOptions([...options, { name: '', extraPrice: 0 }]);
  };

  const updateOption = (index: number, field: string, value: string | number) => {
    const newOptions = [...options];
    (newOptions[index] as any)[field] = value;
    setOptions(newOptions);
  };

  return (
    <Container>
      {!user || !user.role || !allowedRoles.includes(user.role) ?
        (<p>권한이 없습니다.</p>) :
        (<>
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
                <p>https://... 처럼 절대경로를 포함해야합니다.</p>
              </li>
              <li>
                <Label>옵션</Label>
                {options.map((opt, idx) => (
                  <OptionContainer key={idx}>
                    <Input
                      value={opt.name}
                      onChange={(e) => updateOption(idx, 'name', e.target.value)}
                      placeholder="옵션명"
                    />
                    <Input
                      type="number"
                      value={opt.extraPrice}
                      onChange={(e) => updateOption(idx, 'extraPrice', Number(e.target.value))}
                      placeholder="추가금액"
                    />
                  </OptionContainer>
                ))}
                <Button type="button" onClick={addOption}>+ 옵션 추가</Button>
              </li>
            </List>

            <Button type="submit">등록하기</Button>
          </form>
        </>)
      }
    </Container >
  );
}
export default ProductForm