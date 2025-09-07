'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '@/redux/slices/cartSlice';
import styled from 'styled-components';
import { AppDispatch, RootState } from '@/redux/store';
import axios from '@/utils/axiosInstance';
import { useRouter } from 'next/navigation';
import ShippingForm from './ShippingForm';
import DeliveryTimeSelector from './DeliveryTimeSelector';

const Container = styled.div`
  max-width:800px;
  margin:60px auto;
  padding:20px;
`;
const CartItemRow = styled.div`
  display:flex;
  align-items:center;
  justify-content:space-between;
  border-bottom:1px solid #eee;
  padding:10px 0;
`;
const Checkbox = styled.input``;
const ItemName = styled.div`flex:2;`;
const QuantityControl = styled.div`display:flex;align-items:center;gap:8px;`;
const Button = styled.button`
  padding:4px 8px;
  border:1px solid #ccc;
  background:#fff;
  cursor:pointer;
  &:hover{background:#f5f5f5;}
`;
const Price = styled.div`flex:1;text-align:right;`;
const Total = styled.div`margin-top:20px;font-weight:bold;text-align:right;`;
const CheckoutButton = styled.button`
  margin-top:10px;
  padding:10px 16px;
  background:#0070f3;
  color:#fff;
  border-radius:8px;
  cursor:pointer;
`;

interface CartItem {
  _id: string;
  product: { 
    _id: string; 
    name: string; 
    price: number; 
    store?: { _id: string; name: string }; 
  };
  quantity: number;
}

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const cart = useSelector((state: RootState) => state.cart.items) as CartItem[];
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const handleQuantityChange = async (itemId: string, delta: number) => {
    const item = cart.find(i => i._id === itemId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 0) return;

    await axios.post('/cart/add', { productId: item.product._id, quantity: delta });
    dispatch(fetchCart());
  };

  const handleRemove = async (itemId: string) => {
    await axios.post('/cart/remove', { itemId });
    dispatch(fetchCart());
    setSelectedIds(selectedIds.filter(id => id !== itemId));
  };

  const handleCheckbox = (itemId: string) => {
    setSelectedIds(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };

  const totalPrice = cart
    .filter(item => selectedIds.includes(item._id))
    .reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  const handleCheckout = () => {
    if (selectedIds.length === 0) return alert('결제할 항목을 선택하세요.');
    
    const selectedItems = cart
      .filter(item => selectedIds.includes(item._id))
      .map(i => ({
        ...i,
        product: {
          ...i.product,
          store: i.product.store?._id ?? null,
        }
      }));

    router.push(`/checkout?items=${encodeURIComponent(JSON.stringify(selectedItems))}`);
  };

  return (
    <Container>
      <ShippingForm />
      <DeliveryTimeSelector />

      {cart.map(item => (
        <CartItemRow key={item._id}>
          <Checkbox type="checkbox" checked={selectedIds.includes(item._id)} onChange={() => handleCheckbox(item._id)} />
          <ItemName>{item.product.name}</ItemName>
          <QuantityControl>
            <Button onClick={() => handleQuantityChange(item._id, -1)}>-</Button>
            <span>{item.quantity}</span>
            <Button onClick={() => handleQuantityChange(item._id, 1)}>+</Button>
          </QuantityControl>
          <Price>{(item.product.price * item.quantity).toLocaleString()}원</Price>
          <Button onClick={() => handleRemove(item._id)}>삭제</Button>
        </CartItemRow>
      ))}
      <Total>총 결제금액: {totalPrice.toLocaleString()}원</Total>
      <CheckoutButton onClick={handleCheckout}>결제</CheckoutButton>
    </Container>
  );
}
