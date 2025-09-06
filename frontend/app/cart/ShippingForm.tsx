'use client';

import React, { useState } from 'react';
import styled from 'styled-components';

// 📌 타입 정의
interface ShippingInfo {
  receiver: string;
  phone: string;
  address: string;
}

// 레이아웃
const Container = styled.div`
  max-width: 800px;
  margin: 40px auto;
`;

const CartList = styled.div`
  border: 1px solid #ddd;
  padding: 20px;
  margin-top: 20px;
`;

const Input = styled.input`
  display: block;
  width: 100%;
  margin-bottom: 12px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
`;

const SubmitButton = styled.button`
  background: #28a745;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  margin-top: 10px;
`;

const OrderButton = styled(SubmitButton)`
  background: #0070f3;
`;

// 📌 배송지 입력 컴포넌트
const ShippingForm: React.FC = () => {
  const [receiver, setReceiver] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  return (
    <div>
      <h3>배송지 입력</h3>
      <Input
        type="text"
        placeholder="수령인"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
      />
      <Input
        type="text"
        placeholder="연락처"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <Input
        type="text"
        placeholder="주소"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
    </div>
  );
};



export default ShippingForm